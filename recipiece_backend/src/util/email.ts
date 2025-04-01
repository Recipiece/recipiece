import { User, UserValidationToken } from "@recipiece/database";
import { createTransport, SendMailOptions } from "nodemailer";
import { Environment } from "./environment";

export const sendEmail = async (options: SendMailOptions) => {
  if (Environment.SEND_EMAIL) {
    const transporter = createTransport({
      host: Environment.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: Environment.EMAIL_ADDRESS,
        pass: Environment.EMAIL_PASSWORD,
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
    console.log(`environment SEND_EMAIL is set to "${Environment.SEND_EMAIL}", not sending email`);
    console.log("would have sent the following:");
    console.log(options);
    await Promise.resolve();
  }
};

export const sendFinishedImportJobSuccessEmail = async (user: User) => {
  const textEmail = `
Recipiece has finished importing your file! Your recipes should now be available within Recipiece. Happy Cooking!.
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
                background-color: #395144;
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
            Recipiece has finished importing your file! Your recipes should now be available within Recipiece. Happy Cooking!
        </div>
    </body>
</html>
  `;

  await sendEmail({
    from: `"Recipiece" <${Environment.EMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Recipiece - Recipe Import",
    text: textEmail,
    html: htmlEmail,
  });
};

export const sendFinishedImportJobFailedEmail = async (user: User) => {
  const textEmail = `
Recipiece was unable to import your recipes from your recent file upload.
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
                background-color: #395144;
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
            Recipiece was unable to import your recipes from your recent file upload.
        </div>
    </body>
</html>
  `;

  await sendEmail({
    from: `"Recipiece" <${Environment.EMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Recipiece - Recipe Import",
    text: textEmail,
    html: htmlEmail,
  });
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
                background-color: #395144;
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
    from: `"Recipiece" <${Environment.EMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Recipiece - Account Verification",
    text: textEmail,
    html: htmlEmail,
  });
};

export const sendForgotPasswordEmail = async (user: User, token: UserValidationToken) => {
  const textEmail = `
A request to reset your password was just made for this email address.
If this was not performed by you, you may ignore this request.

If you would like to reset your password, navigate to the link below and follow the instructions.
https://recipiece.org/reset-password/?token=${token.id}
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
                background-color: #395144;
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
            A request to reset your password was just made for this email address.
            If this was not performed by you, you may ignore this request.
            <br />
            If you would like to reset your password, navigate to the link below and follow the instructions.
            <a href="https://recipiece.org/reset-password/?token=${token.id}">Reset Password</a>
            This token will expire in one hour.
        </div>
    </body>
</html>
  `;

  await sendEmail({
    from: `"Recipiece" <${Environment.EMAIL_ADDRESS}>`,
    to: user.email,
    subject: "Recipiece - Reset Password",
    text: textEmail,
    html: htmlEmail,
  });
};
