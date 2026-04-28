import React, { useEffect, useState, useMemo } from 'react';
import './ResourceWiseHeatmap.css';

/**
 * ResourceWiseHeatmap Component
 * Visualizes resource usage frequency across different time slots.
 * Includes filtering by type and highlighting top usage.
 */
export default function ResourceWiseHeatmap() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const timeSlots = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00"];

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const response = await fetch('/api/resources/resource-heatmap');
                if (!response.ok) throw new Error('Failed to fetch heatmap data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);

    // Extract unique resource types for filter
    const resourceTypes = useMemo(() => {
        const types = new Set(data.map(item => item.resourceType));
        return ['ALL', ...Array.from(types)];
    }, [data]);

    // Transform and filter data
    const { resourceMap, topCells } = useMemo(() => {
        const filteredData = filterType === 'ALL' ? data : data.filter(item => item.resourceType === filterType);
        const map = {};
        const allUsageValues = [];

        filteredData.forEach(item => {
            if (!map[item.resourceName]) {
                map[item.resourceName] = { 
                    type: item.resourceType, 
                    slots: {} 
                };
            }
            map[item.resourceName].slots[item.timeSlot] = item.usageCount;
            allUsageValues.push({ res: item.resourceName, slot: item.timeSlot, count: item.usageCount });
        });

        // Identify top 3 most used cells
        const sorted = [...allUsageValues].sort((a, b) => b.count - a.count);
        const top = sorted.slice(0, 3).map(i => `${i.res}-${i.slot}`);

        return { resourceMap: map, topCells: top };
    }, [data, filterType]);

    const resources = Object.keys(resourceMap);

    if (loading) return <div className="heatmap-loader">Analyzing resource patterns...</div>;
    if (error) return <div className="heatmap-error">Error: {error}</div>;

    const getColorIntensity = (count) => {
        if (!count) return 'cell-empty';
        if (count < 15) return 'cell-low';
        if (count < 30) return 'cell-medium-low';
        if (count < 45) return 'cell-medium';
        if (count < 60) return 'cell-high';
        return 'cell-extreme';
    };

    return (
        <div className="heatmap-container">
            <div className="heatmap-header">
                <div className="header-text">
                    <h2>Resource-wise Usage Heatmap</h2>
                    <p>Visual analytics for campus facility utilization.</p>
                </div>
                <div className="heatmap-controls">
                    <label>Filter by Type:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        {resourceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="heatmap-grid-wrapper">
                <table className="heatmap-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Resource</th>
                            {timeSlots.map(slot => (
                                <th key={slot}>{slot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map(resource => (
                            <tr key={resource}>
                                <td className="resource-name sticky-col">
                                    <div className="res-name-wrapper">
                                        <span className="res-main-name">{resource}</span>
                                        <span className="res-type-badge">{resourceMap[resource].type}</span>
                                    </div>
                                </td>
                                {timeSlots.map(slot => {
                                    const count = resourceMap[resource].slots[slot] || 0;
                                    const isTop = topCells.includes(`${resource}-${slot}`);
                                    return (
                                        <td 
                                            key={`${resource}-${slot}`} 
                                            className={`heatmap-cell ${getColorIntensity(count)} ${isTop ? 'cell-top-highlight' : ''}`}
                                        >
                                            <div className="cell-content">
                                                <span className="usage-count">{count}</span>
                                                {isTop && <span className="top-badge">Top</span>}
                                                <div className="tooltip">
                                                    <strong>{resource}</strong>
                                                    <span>{slot}</span>
                                                    <span>Usage: {count} times</span>
                                                    {isTop && <span className="top-label">🔥 Peak Usage</span>}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="heatmap-footer">
                <div className="heatmap-legend">
                    <span>Usage Intensity:</span>
                    <div className="legend-item"><div className="legend-box cell-empty"></div> 0</div>
                    <div className="legend-item"><div className="legend-box cell-low"></div> 1-15</div>
                    <div className="legend-item"><div className="legend-box cell-medium-low"></div> 16-30</div>
                    <div className="legend-item"><div className="legend-box cell-medium"></div> 31-45</div>
                    <div className="legend-item"><div className="legend-box cell-high"></div> 46-60</div>
                    <div className="legend-item"><div className="legend-box cell-extreme"></div> 60+</div>
                </div>
                <div className="heatmap-stats">
                    Showing {resources.length} resources
                </div>
            </div>
        </div>
    );
}
