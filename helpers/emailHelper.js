import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const userGmail = process.env.GMAIL_USER;
const passAppGmail = process.env.GMAIL_PASS_APP;
const userSender = process.env.GMAIL_SENDER;

const emailHelper = async (to, subject, text, htmlContent) => {
  // Crea un transportador
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userGmail,
      pass: passAppGmail,
    },
  });

  // Opciones del correo
  let mailOptions = {
    from: userSender,
    to: to,
    subject,
    text: text,
    html: htmlContent,  // Usar contenido HTML
  };

  // Enviar el correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);
    return info;
  } catch (error) {
    console.error("Error enviando el email:", error);
    throw error;
  }
};

export default emailHelper;
