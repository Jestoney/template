import mongoose from 'mongoose';

// Enable Mongoose debug logs
mongoose.set('debug', true);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds if no server is selected
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            retryWrites: true, // Retry write operations if they fail
            retryReads: true, // Retry read operations if they fail
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('Successfully connected to MongoDB');
                return mongoose;
            })
            .catch((err) => {
                console.error('MongoDB connection error:', err.message);
                console.error('Error details:', err); // Log the full error object
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        throw error;
    }
}

export default dbConnect;