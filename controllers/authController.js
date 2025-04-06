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
    console.log(otp);
    try {
        await sendEmail(email, message, sharedToken);
        emailTokens[email] = { otp, expirationTime };
    } catch (error) {
        next(new ErrorHandler("Failed to send OTP email", 500));
    }
};

const emailVerification = tryCatch(async (req, res, next) => {
	const { email, role } = req.body;
	if (!email) return next(new ErrorHandler("Please fill your email", 404));

    let user;
    if(role === "Doctor") user = await Doctor.findOne({ d_email : email });
    else if (role === "Nurse") user = await Nurse.findOne({n_email : email});
    else user = await Nurse.findOne({ s_email : email});

    if (!user) return next(new ErrorHandler("User do not exists", 404));

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
	if(role === "Doctor") user = await Doctor.findOne({ d_email : email });
    else if (role === "Nurse") user = await Nurse.findOne({n_email : email});
    else user = await Hs.findOne({ s_email : email});

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
    userRole = role;
    console.log(userRole);
    
    let user;
    if (role === "Doctor") user = await Doctor.findOne({ d_email : email }).select("+password");
    else if (role === "Nurse") user = await Nurse.findOne({ n_email : email }).select("+password");
    else user = await Hs.findOne({ s_email : email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid credentials", 404));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler("Invalid credentials", 401));

    const name = (role === "Doctor") ? user.d_name : role === "Nurse" ? user.n_name : user.s_name;
    sendToken(res, user, 200, `Welcome back, ${name}`);
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
    else user = await Hs.findById(req.user);

    if (!user) return next(new ErrorHandler("User not found", 404));

    if (role === "Doctor") user.d_name = newUserName;
    else if (role === "Nurse") user.n_name = newUserName;
    else user.s_name = newUserName;

    await user.save();
    return res.status(200).json({ success: true });
});

const getMyProfile = tryCatch(async (req, res) => {
    let user;
    if(userRole === "Doctor") user = await Doctor.findById(req.user);
    else if(userRole === "Nurse") user = await Nurse.findById(req.user);
    else user = await Hospital_Staff.findById(req.user);
    console.log(user);
    return res.status(200).json({
        success: true,
		user,
    });
});

const setNewPassword = tryCatch(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password) return next(new ErrorHandler("Please fill all the fields", 404));

    let user;
    if(role === "Doctor") user = await Doctor.findOne({ d_email: email });
    else if(role === "Nurse") user = await Nurse.findOne({ n_email: email });
    else user = await Hs.findOne({ s_email: email });
    if (!user) return next(new ErrorHandler("User do not exists", 404));

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