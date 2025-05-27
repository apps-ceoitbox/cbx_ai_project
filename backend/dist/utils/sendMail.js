"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAIL = MAIL;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function MAIL(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, subject, body, attachment, cc = [], template = null }) {
        let buffer = null;
        if (attachment) {
            buffer = Buffer.from(attachment, 'base64');
        }
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        const mailOptions = {
            from: 'CBX AI <apps@ceoitbox.com>',
            to,
            subject: subject,
            html: template == "OTP" ? EmailTemplate(body) : body,
            cc,
            attachments: []
        };
        if (buffer) {
            mailOptions.attachments = [
                {
                    filename: subject,
                    content: buffer,
                    contentType: 'application/pdf'
                }
            ];
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    });
}
function EmailTemplate(OTP) {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>OTP</title>
    
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style="
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: #ffffff;
          font-size: 14px;
        "
      >
        <div
          style="
            max-width: 680px;
            margin: 0 auto;
            padding: 45px 30px 60px;
            background: #f4f7ff;
            background-image: url(https://auth.ceoitbox.com/static/bg.jpg);
            background-repeat: no-repeat;
            background-size: 800px 452px;
            background-position: top center;
            font-size: 14px;
            color: #434343;
          "
        >
          <header>
            <table style="width: 100%">
              <tbody>
                <tr style="height: 0">
                  <td>
                    <a target="_blank" href="https://ceoitbox.com">
                      <img
                        style="border-radius: 5px"
                        alt=""
                        src="https://i.ibb.co/K00ch0m/CEOITBOX-Logo-Small.png"
                        height="60px"
                      />
                    </a>
                  </td>
                  <td style="text-align: right">
                    <span style="font-size: 16px; line-height: 30px; color: #ffffff"
    
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </header>
    
          <main>
            <div
              style="
                margin: 0;
                margin-top: 70px;
                padding: 92px 30px 115px;
                background: #ffffff;
                border-radius: 30px;
                text-align: center;
              "
            >
              <div style="width: 100%; max-width: 489px; margin: 0 auto">
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 500;
                    color: #1f1f1f;
                  "
                >
                  Your OTP
                </h1>
                <p
                  style="
                    margin: 0;
                    margin-top: 17px;
                    font-weight: 500;
                    letter-spacing: 0.56px;
                  "
                >
                  Thank you for choosing CEOITBOX. Use the following OTP to complete
                  the procedure to change your email address. Do not share this code
                  with others, including CEOITBOX employees.
                </p>
                <p
                  style="
                    margin: 0;
                    margin-top: 60px;
                    font-size: 40px;
                    font-weight: 600;
                    letter-spacing: 25px;
                    color: #ba3d4f;
                  "
                >
                  ${OTP}
                </p>
              </div>
            </div>
    
            <p
              style="
                max-width: 400px;
                margin: 0 auto;
                margin-top: 90px;
                text-align: center;
                font-weight: 500;
                color: #8c8c8c;
              "
            >
              Need help? Ask at
              <a
                href="mailto:sujit@ceoitbox.in"
                style="color: #499fb6; text-decoration: none"
                >sujit@ceoitbox.in</a
              >
              or visit our
              <a
                href="https://ceoitbox.com/"
                target="_blank"
                style="color: #499fb6; text-decoration: none"
                >Website</a
              >
            </p>
          </main>
    
          <footer
            style="
              width: 100%;
              max-width: 490px;
              margin: 20px auto 0;
              text-align: center;
              border-top: 1px solid #e6ebf1;
            "
          >
            <p
              style="
                margin: 0;
                margin-top: 40px;
                font-size: 16px;
                font-weight: 600;
                color: #434343;
              "
            >
              CEOITBOX
            </p>
            <p style="margin: 0; margin-top: 8px; color: #434343">
              293, Dhan Mill Rd, Chhatarpur Hills, Pocket D, Dr Ambedkar Colony,
              Chhatarpur, New Delhi, Delhi 110074
            </p>
            <div style="margin: 0; margin-top: 16px">
              <a
                href="https://www.facebook.com/ceoitbox/"
                target="_blank"
                style="display: inline-block"
              >
                <img
                  width="36px"
                  alt="Facebook"
                  src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
                />
              </a>
              <a
                href="https://www.instagram.com/ceoitbox/"
                target="_blank"
                style="display: inline-block; margin-left: 8px"
              >
                <img
                  width="36px"
                  alt="Instagram"
                  src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
              /></a>
              <a
                href="https://www.youtube.com/@SanjeevJainCBX"
                target="_blank"
                style="display: inline-block; margin-left: 8px"
              >
                <img
                  width="36px"
                  alt="Youtube"
                  src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
              /></a>
            </div>
            <p style="margin: 0; margin-top: 16px; color: #434343">
              Copyright © ${new Date().getFullYear()} CEOITBOX. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>    
    `;
}
