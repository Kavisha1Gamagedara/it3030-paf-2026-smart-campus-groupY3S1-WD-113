const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Load MONGO_URL from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUrlMatch = envContent.match(/MONGO_URL=(.*)/);

if (!mongoUrlMatch) {
    console.error("Could not find MONGO_URL in .env file");
    process.exit(1);
}

const mongoUrl = mongoUrlMatch[1].trim();

async function clearBookings() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUrl);
        console.log("Connected successfully.");

        console.log("Clearing 'bookings' collection...");
        // We use the direct collection to avoid needing the model schema
        const result = await mongoose.connection.collection('bookings').deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} old bookings.`);

        console.log("Database cleared! You can now restart your backend.");
        process.exit(0);
    } catch (err) {
        console.error("Error clearing database:", err);
        process.exit(1);
    }
}

clearBookings();
