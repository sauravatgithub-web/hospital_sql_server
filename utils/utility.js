import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS,
    }
});

class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const sendEmail = (email, subject, sharedToken, entity, name) => {
    const text = 
        (sharedToken) ? `Your OTP is: ${sharedToken}` : 
        `Hello ${name}, Congratulations on being added as a new ${entity} on AzureMed Hospital.`

    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: subject,
            text: text
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.error('Error sending mail: ', error);
                reject(error);
            }
            else resolve(info);
        });
    });
}

export { ErrorHandler, sendEmail }