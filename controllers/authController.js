import bcrypt, { hash } from "bcrypt";
import { cookieOption, sendToken } from "../utils/features.js";
import { tryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import Doctor from "../models/doctorModel.js";
import Nurse from "../models/nurseModel.js";
import Hp from "../models/hpModel.js";
import Hs from "../models/hsModel.js";

const sendOTP = async (email, message, next) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
	const { email, resetting } = req.body;
	if (!email) return next(new ErrorHandler("Please fill your email", 404));

	if (resetting) {
		const User = await Doctor.findOne({ email });
		if (!User) return next(new ErrorHandler("Doctor do not exists", 404));
	}

	sendOTP(email, "Email Verification", next);
	res.status(200).json({
		success: true,
		role: role,
		secretQuestion: secretQuestion,
		message: "An OTP has been sent to your email.",
	});
});

const confirmOTP = tryCatch(async (req, res, next) => {
	// const { email, resetting, otp, secretAnswer } = req.body;
	const { email, resetting, otp } = req.body;
	if (!email || !otp) return next(new ErrorHandler("Please fill all fields", 404));

	// if (resetting && !secretAnswer) return next(new ErrorHandler("Please fill secret answer", 404));

	const User = await Doctor.findOne({ email });
	// if (resetting && secretAnswer !== Customer.secretAnswer)
	// 	return next(new ErrorHandler("Please give coreect answer", 404));

	const sharedOTP = emailTokens[email];

	if (sharedOTP && sharedOTP.otp == otp && Date.now() < sharedOTP.expirationTime) {
		return res.status(200).json({ success: true, message: "OTP has been successfully verified." });
	} else if (sharedOTP && sharedOTP.otp != otp) {
		return res.status(400).json({ success: false, message: "Incorrect OTP entered." });
	} else return res.status(400).json({ success: false, message: "OTP expired." });
});


const login = tryCatch(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || role) {
        return next(new ErrorHandler("Please fill all the fields", 404));
    }

    let user;
    if (role === "Doctor") user = await Doctor.findOne({ d_email : email }).select("+password");
    else if (role === "Nurse") user = await Nurse.findOne({ n_email : email }).select("+password");
    else if (role === "Hp") user = await Hp.findOne({ h_email : email }).select("+password");
    else user = await Hs.findOne({ s_email : email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid credentials", 404));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler("Invalid credentials", 401));

    const name = role === "Doctor" ? user.d_name : role === "Nurse" ? user.n_name : role === "Hp" ? user.h_name : user.s_name;
    
    if(toRemember) sendToken(res, user, 200, `Welcome back, ${name}`);
    return res.status(200).json({ success: true, message: `Welcome back, ${name}`, user: user});
});

const logOut = tryCatch(async (req, res) => {
    return res
        .status(200)
        .cookie("token", "", { ...cookieOption, maxAge: 0 })
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
    else if (role === "Hp") user = await Hp.findById(req.user);
    else user = await Hs.findById(req.user);

    if (!user) return next(new ErrorHandler("User not found", 404));

    if (role === "Doctor") user.d_name = newUserName;
    else if (role === "Nurse") user.n_name = newUserName;
    else if (role === "Hp") user.h_name = newUserName;
    else user.s_name = newUserName;

    await user.save();
    return res.status(200).json({ success: true });
});

export {
    login,
    logOut,
    updateUserName
};