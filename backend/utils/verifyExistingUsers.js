import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const verifyExistingUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );

        console.log(`Updated ${result.modifiedCount} existing users to isVerified: true`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

verifyExistingUsers();
