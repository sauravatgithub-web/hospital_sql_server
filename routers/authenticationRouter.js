import express from 'express'
import {
    emailVerification,
    confirmOTP,
    login,
    logOut,
    updateUserName
} from '../controllers/authController.js'
import { isAuthenticated } from '../middlewares/auth.js';
import { emailValidator, otpValidator, validate } from '../lib/validator.js';

const router = express.Router();

// router.post('/verifyOTP', otpValidator(), validate, confirmOTP);

// router.post('/verifyEmail', emailValidator(), validate, emailVerification);
// router.post('/new', newAccount);
router.post('/login', login);
// router.post('/forgetPassword', forgetPassword);
// router.post('/setPassword', setNewPassword);

router.use(isAuthenticated); 
// router.get("/me", getMyProfile);
// router.get("/updateUserName",updateUserName);
router.get("/logOut", logOut);

export default router;