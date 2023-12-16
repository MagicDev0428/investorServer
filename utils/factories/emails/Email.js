import nodemailer from 'nodemailer';
import { FailServerError } from "../../errors";
import { getGoogleDriveInstance } from '../google';

export class Email {
  constructor(email) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_EMAIL_ADDRESS,
        pass: process.env.GOOGLE_EMAIL_PASSWORD
      }
    });
    this.email = email;
    this.html = undefined;
    this.text = undefined;
    this.subject = 'Email';
    this.attachments = [];
  }

  async send() {
    if (this.html === undefined && this.text === undefined) {
      throw new Error('HTML and TEXT can not be both empty at the same time. Kindly provide at least one.');
    }

    const options = {
      from: process.env.GOOGLE_EMAIL_ADDRESS,
      to: this.email,
      subject: this.subject,
    };

    // Check if 'html' is provided and use it. If not, check if 'text' is provided.
    if (this.html) {
      options.html = this.html;
    } else if (this.text) {
      options.text = this.text;
    }

    if (this.attachments.length > 0) {
      options.attachments = this.attachments;
    }

    try {
      const info = await this.transporter.sendMail(options);
      return info.messageId;      
    } catch (error) {
      console.log('error ', error);
      throw new FailServerError('Email could not be sent');
    }
  }

  setHtml (html) {
    this.html = html;
  }

  setText (text) {
    this.text = text;
  }

  setSubject (subject) {
    this.subject = subject;
  }

  async attach (fileId) {
    const fileInfo = await getGoogleDriveInstance().get(fileId);
    
    if (fileInfo.mimeType !== 'application/pdf') {
      throw new Error(`File with ${fileId} is not a pdf. Provide a valid pdf file id.`);
    }

    const pdfStream = await getGoogleDriveInstance().getFileStream(
      fileId
    );

    this.attachments.push({ filename: fileInfo.name, content: pdfStream });
  }
}