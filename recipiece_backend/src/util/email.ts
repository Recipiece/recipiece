import { User, UserValidationToken } from "@prisma/client";
import { readFileSync } from "fs";
import { createTransport, SendMailOptions } from "nodemailer";

export const sendEmail = async (options: SendMailOptions) => {
  if (process.env.APP_SEND_EMAIL === "Y") {
    const transporter = createTransport({
      host: process.env.APP_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    const sendMailPromise = new Promise<void>((resolve, reject) => {
      transporter.sendMail(options, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await sendMailPromise;
  } else {
    console.log(`APP_SEND_EMAIL is set to "${process.env.APP_SEND_EMAIL}", not sending email`);
    console.log("Would have sent the following:");
    console.log(options);
    await Promise.resolve();
  }
};

export const sendAccountVerificationEmail = async (user: User, token: UserValidationToken) => {
  const textEmail = `
Welcome to Recipiece! Please use the following code to verify your account:
${token.id}
This token will expire in one hour.  
`;

  const htmlEmail = `
<html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Handlee&display=swap" rel="stylesheet">
        <style>
            html, body {
                padding: 16px;
                margin: 0;
            }
            .header {
                color: white;
                background-color: #B43F3F;
                width: 100%;
                font-family: "Handlee", cursive;
                font-weight: 400;
                font-style: normal;
                text-align: center;
            }

            .content {
                font-family: sans-serif;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Recipiece</h1>
        </div>
        <div class="content">
            Welcome to Recipiece! Please use the following code to verify your account:<br />
            <h3>${token.id}</h3>
            This token will expire in one hour.
        </div>
    </body>
</html>
  `;

  await sendEmail({
    from: `"Recipiece" <${process.env.APP_EMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Recipiece Account Verification",
    text: textEmail,
    html: htmlEmail,
  });
};
