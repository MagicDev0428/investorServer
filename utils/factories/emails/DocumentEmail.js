import { Email } from "./Email";

export class DocumentEmail extends Email {
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
      subject: 'Document Email',
      html: this.html,
      attachments: [
        { filename: this.filename, content: this.content }
      ]
    };
  }
}