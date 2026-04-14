import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import ResourceCatalogue from './features/facilities/ResourceCatalogue';

function App() {
    return (
        <BrowserRouter>
            <nav style={{ padding: '20px', backgroundColor: '#eee', marginBottom: '20px' }}>
                <Link to="/facilities" style={{ marginRight: '10px' }}>Facilities</Link>
                {/* Add more links for other modules as they are developed */}
            </nav>
            <Routes>
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/facilities" replace />} />

                {/* Your Route */}
                <Route path="/facilities" element={<ResourceCatalogue />} />

                {/* Other Members' Routes */}
                {/* <Route path="/bookings" element={<BookingDashboard />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
