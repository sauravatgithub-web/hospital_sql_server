import bcrypt, { hash } from "bcrypt";
import { cookieOption, sendToken } from "../utils/features.js";
import { tryCatch } from "../middlewares/error.js";
import { ErrorHandler, sendEmail } from "../utils/utility.js";
import Doctor from "../models/doctorModel.js";
import Nurse from "../models/nurseModel.js";
import Hs from "../models/hsModel.js";
import Hospital_Staff from "../models/hsModel.js";

const emailTokens = {};
let userRole;

const sendOTP = async (email, message, next) => {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const sharedToken = `${otp}`;
    console.log("otp: ", otp);
    try {
        await sendEmail(email, message, sharedToken);
        emailTokens[email] = { otp, expirationTime };
    } 
    catch (error) {
        next(new ErrorHandler("Failed to send OTP email", 500));
    }
};

const emailVerification = tryCatch(async (req, res, next) => {
	const { email, role } = req.body;
	if (!email) return next(new ErrorHandler("Please fill your email", 404));

    let user;
    if(role === "Doctor") user = await Doctor.findOne({ email : email });
    else if (role === "Nurse") user = await Nurse.findOne({email : email});
    else if(role === "FDO" || role === "DEO") user = await Hs.findOne({ email : email});
    
    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

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

    let user;
	if(role === "Doctor") user = await Doctor.findOne({ email : email });
    else if (role === "Nurse") user = await Nurse.findOne({ email : email});
    else if(role === "FDO" || role === "DEO") user = await Hs.findOne({ email : email});

    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

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
    
    let user;
    if (role === "Doctor") {
        user = await Doctor.findOne({ email : email }).select("+password");
    }
    else if (role === "Nurse") {
        user = await Nurse.findOne({ email : email }).select("+password");
    }
    else if(role === "FDO" || role === "DEO") {
        user = await Hs.findOne({ email : email, role: role }).select("+password");
    }

    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

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
    let user;
    if (role === "Doctor") user = await Doctor.findById(req.user);
    else if (role === "Nurse") user = await Nurse.findById(req.user);
    else if(role === "FDO" || role === "DEO") user = await Hs.findById(req.user);
    
    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

    user.userName = newUserName;
    await user.save();
    return res.status(200).json({ success: true });
});

const getMyProfile = tryCatch(async (req, res) => {
    let user;
    if(userRole === "Doctor") user = await Doctor.findById(req.user);
    else if(userRole === "Nurse") user = await Nurse.findById(req.user);
    else if(userRole === "FDO" || userRole === "DEO") user = await Hospital_Staff.findById(req.user);
    
    return res.status(200).json({
        success: true,
		user: user,
    });
});

const setNewPassword = tryCatch(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password) return next(new ErrorHandler("Please fill all the fields", 404));

    let user;
    if(role === "Doctor") user = await Doctor.findOne({ email: email });
    else if(role === "Nurse") user = await Nurse.findOne({ email: email });
    else if(role === "FDO" || role === "DEO") user = await Hs.findOne({ email : email});
    
    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

    user.password = password;
    await user.save();
    return res.status(200).json({ success: true, user: user, message: "Password has been updated." });
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