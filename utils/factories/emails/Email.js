import nodemailer from 'nodemailer';
import { FailServerError } from "../../errors";

export class Email {
  constructor() {
    if (new.target === Email) {
      throw new Error('Cannot construct Email instances directly');
    }
    console.log(process.env.GOOGLE_EMAIL_ADDRESS, process.env.GOOGLE_EMAIL_PASSWORD)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_EMAIL_ADDRESS,
        pass: process.env.GOOGLE_EMAIL_PASSWORD
      }
    });
  }

  async constructOtions() {
    throw new Error("You have to implement the method constructOtions");
  }

  async send() {
    const options = await this.constructOtions();
    console.log(options.attachments)
    try {
      const info = await this.transporter.sendMail(options);
      return info.messageId;      
    } catch (error) {
      console.log('error ', error);
      throw new FailServerError('Email could not be sent');
    }
  }
}