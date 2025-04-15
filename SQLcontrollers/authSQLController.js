import bcrypt, { hash } from "bcrypt";
import { cookieOption, sendToken } from "../utils/features.js";
import { tryCatch } from "../middlewares/error.js";
import { ErrorHandler, sendEmail } from "../utils/utility.js";
import client from "../db.js";

import {
    doctorQuery,
    nurseQuery,
    hospitalStaffQuery
} from '../queries/authQuery.js';

const emailTokens = {};
let userRole;

const sendOTP = async (email, message, next) => {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const sharedToken = `${otp}`;
    console.log(otp);
    try {
        await sendEmail(email, message, sharedToken);
        emailTokens[email] = { otp, expirationTime };
    } 
    catch (error) {
        next(new ErrorHandler("Failed to send OTP email", 500));
    }
};

const getUserByEmail = async (email, role) => {
    // let table;
    // if (role === "Doctor") table = "Doctor";
    // else if (role === "Nurse") table = "Nurse";
    // else if (role === "FDO" || role === "DEO") table = "Hospital_Staff";
    // else return null;

    if (role === "Doctor") return doctorQuery('email',email);
    else if (role === "Nurse") return nurseQuery('email',email);
    else if (role === "FDO" || role === "DEO") return hospitalStaffQuery('email',email);
    else return null;
    

    // const { rows } = await client.query(
    //     `SELECT * FROM ${table} WHERE email = $1 AND active = TRUE`,
    //     [email]
    // );
    // return rows[0];
};

const emailVerification = tryCatch(async (req, res, next) => {
	const { email, role } = req.body;
	if (!email) return next(new ErrorHandler("Please fill your email", 404));

    const user = await getUserByEmail(email, role);
    if (!user) return next(new ErrorHandler("Invalid credentials", 404));

	sendOTP(email, "Email Verification", next);
	res.status(200).json({
		success: true,
		role: role,
		message: "An OTP has been sent to your email.",
	});
});

const confirmOTP = tryCatch(async (req, res, next) => {
	const { email, otp, role } = req.body;
	if (!email || !otp) return next(new ErrorHandler("Please fill all fields", 404));

    const user = await getUserByEmail(email, role);
    if (!user) return next(new ErrorHandler("Invalid credentials", 404));

	const sharedOTP = emailTokens[email];

	if(sharedOTP && sharedOTP.otp == otp && Date.now() < sharedOTP.expirationTime) {
		return res.status(200).json({ success: true, message: "OTP has been successfully verified." });
	} 
    else if(sharedOTP && sharedOTP.otp != otp) {
		return res.status(400).json({ success: false, message: "Incorrect OTP entered." });
	} 
    else return res.status(400).json({ success: false, message: "OTP expired." });
});


const login = tryCatch(async (req, res, next) => {
    const { email, password, role } = req.body;
    if(!email || !password || !role) {
        return next(new ErrorHandler("Please fill all the fields", 404));
    }
    
    const user = await getUserByEmail(email, role);
    if (!user) return next(new ErrorHandler("Invalid credentials", 404));
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler("Invalid credentials", 401));
    
    userRole = role;
    sendToken(res, user, 200, `Welcome back, ${user.name}`);
});

const logOut = tryCatch(async (req, res) => {
    return res
        .status(200)
        .cookie("h_token", "", { ...cookieOption, maxAge: 0 })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});


const updateUserName = tryCatch(async (req, res) => {
    const  { newUserName, role } = req.body;
    
    let table;
    if (role === "Doctor") table = "Doctor";
    else if (role === "Nurse") table = "Nurse";
    else if (role === "FDO" || role === "DEO") table = "Hospital_Staff";
    else return next(new ErrorHandler("Invalid credentials", 404));
    
    await client.query(`UPDATE ${table} SET "userName" = $1 WHERE _id = $2`, [
        newUserName,
        req.user,
    ]);
    return res.status(200).json({ success: true });
});

const getUserById = async (id, role) => {

    if (role === "Doctor") return doctorQuery('_id',id);
    else if (role === "Nurse") return nurseQuery('_id',id);
    else if (role === "FDO" || role === "DEO") return hospitalStaffQuery('_id',id);
    else return null;
    
    // let table;
    // if (role === "Doctor") table = "Doctor";
    // else if (role === "Nurse") table = "Nurse";
    // else if (role === "FDO" || role === "DEO") table = "Hospital_Staff";
    // else return null;

    // const { rows } = await client.query(
    //     `SELECT * FROM ${table} WHERE _id = $1 AND active = TRUE`,
    //     [id]
    // );
    // return rows[0];
};

const getMyProfile = tryCatch(async (req, res) => {
    const userId = req.user;
    const user = await getUserById(userId, userRole);
    return res.status(200).json({ success: true, user });
});

const setNewPassword = tryCatch(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password) return next(new ErrorHandler("Please fill all the fields", 404));

    const hashed = await bcrypt.hash(password, 10);
    let table;
    if (role === "Doctor") table = "Doctor";
    else if (role === "Nurse") table = "Nurse";
    else if (role === "FDO" || role === "DEO") table = "Hospital_Staff";
    else return next(new ErrorHandler("Invalid credentials", 404));

    await client.query(`UPDATE ${table} SET password = $1 WHERE email = $2`, [
        hashed,
        email,
    ]);

    return res.status(200).json({
        success: true,
        message: "Password has been updated.",
    });
});

export {
    emailVerification,
    confirmOTP,
    login,
    getMyProfile,
    logOut,
    updateUserName,
    setNewPassword
};