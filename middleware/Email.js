import { transporter } from "./Email.config.js";
import { Verification_Email_Template } from "./EmailTemplate.js";

export const SendVerificationCode = async (email, verificationCode) => {
  try {
    const responce = await transporter.sendMail({
      from: '"Dhaniyel" <dhaniyeldarvesh7@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Verify Your Email", // Subject line
      text: "Verify Your Email", // plain text body
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ), // html body
    });
    console.log("responce message: ", responce);
  } catch (error) {
    console.log("email send error: ", error);
  }
};
