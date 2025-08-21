import bcrypt from "bcrypt";
import userModel from '../models/usermodel.js';
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import 'dotenv/config';
import { json } from "express";

export const register = async (req, res) => {
    let { name, email, password } = req.body;
    email = email.toLowerCase();

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' })
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Car Rental',
            text: `Welcome to Car Rental Website. 
            Your account has been created with email ID: ${email}`
        };


        await transporter.sendMail(mailOptions);

        return res.json({ success: true });

    } catch (error) {
        console.error("Registration error:", error);
        res.json({ success: false, message: error.message })
    }
};

export const login = async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({ success: true, message: "Logged out" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userID } = req.body;

        const user = await userModel.findById(userID);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your Account using this OTP.`
        }
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Verification OTP sent to email' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userID, otp } = req.body;

    if (!userID || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }
    try {
        const user = await userModel.findById(userID);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenticated = async (req, res) => {
    try{
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// send password reset otp
export const sendPasswordResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({success: false, message: 'Email is required'})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.ResetOtp = otp;
        user.ResetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    }
    catch(error) {
        return res.json({success: false, message: error.message });
    }
} 