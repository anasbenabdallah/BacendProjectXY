// backend/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail direct
  auth: {
    user: process.env.SMTP_USER, // ton email complet
    pass: process.env.SMTP_PASS, // mot de passe d'application
  },
});
