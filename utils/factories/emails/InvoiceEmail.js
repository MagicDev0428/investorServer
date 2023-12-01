import { Email } from "./Email";
import fs from 'fs';

export class InvoiceEmail extends Email {
  constructor(email, html, filename, content) {
    super();
    this.email = email;
    this.html = html;
    this.filename = filename;
    this.content = content;
  }

  async constructOtions() {
    return {
      from: process.env.GOOGLE_EMAIL_ADDRESS,
      to: this.email,
      subject: 'Invoice Email',
      html: this.html,
      attachments: [
        { filename: this.filename, content: this.content }
      ]
    };
  }
}