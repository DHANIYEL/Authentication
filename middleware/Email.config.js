import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "dhaniyeldarvesh7@gmail.com",
    pass: "oxcf xzul drgt cwyy",
  },
});

const SendEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Dhaniyel 👻" <dhaniyeldarvesh7@gmail.com>', // sender address
      to: "dhaniyeldarvesh26@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    console.log(info);
  } catch (error) {
    console.log("Error sending email", error);
  }
};

SendEmail();
