import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const cookieOption = {
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    sameSite: "none", 
    httpOnly: true, 
    secure: true, 
};

const connectDB = (uri) => {
    mongoose
        .connect(uri, { dbName: "Hospital" })
        .then(() => console.log(`✅ Connected to MongoDB database: Hospital`))
        .catch((err) => {
            console.error("❌ MongoDB connection failed:", err);
            process.exit(1); 
        })
};

const sendToken = (res, user, code, message) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    return res.status(code).cookie('h_token', token, cookieOption).json({
        success: true,
        user: user,
        message,
        role: user.role
    })
};

export { cookieOption, connectDB, sendToken };