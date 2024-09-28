import express from "express";
import emailHelper from "./helpers/emailHelper.js";
import mongoose from 'mongoose';
import cron from 'node-cron';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import Sale from './models/Sale.js';
import Cart from './models/Cart.js';
import ConsolidatedSaleData from './models/ConsolidatedSaleData.js';
import { writeToSheet } from './writeGS.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Conexión a MongoDB
const mongoDBURL = process.env.MONGODB_URL;

mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((error) => {
    console.error('Error en la conexión a la base de datos:', error);
  });

// Rutas HTTP
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    let info = await emailHelper(to, subject, text);
    res.status(200).send(`Email sent: ${info.response}`);
  } catch (error) {
    res.status(500).send("Error sending email");
  }
});

// Start the server
// En local Vercel gestionará el puerto, por lo que no hace falta el listen
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running...`);
});


// Función para sincronizar pagos con Google Sheets
const syncPaymentsWithGoogleSheets = async () => {
  try {
    const currentTime = new Date();
    const lastHourUTC = new Date(currentTime.getTime() - 4 * 60 * 60 * 1000);

    console.log('Hora actual en UTC:', currentTime.toISOString());
    console.log('Buscando pagos creados después de (UTC):', lastHourUTC.toISOString());

    const payments = await Payment.find({ dateCreated: { $gte: lastHourUTC }, isSynced: false });
    console.log('Pagos no sincronizados encontrados:', payments.length);

    if (payments.length > 0) {
      for (const payment of payments) {
        console.log(`Procesando pago: ID ${payment.paymentId}, external_reference ${payment.external_reference}`);

        const sale = await Sale.findOne({ external_reference: payment.external_reference });
        if (!sale) {
          console.error(`No se encontró la venta con referencia ${payment.external_reference}`);
          continue;
        }

        const cart = await Cart.findOne({ cartId: payment.external_reference });
        if (!cart) {
          console.error(`No se encontró el carrito con cartId ${payment.external_reference}`);
          continue;
        }

        // Aquí obtenemos la cantidad del carrito correctamente
        const postalCode = cart.postalCode || 'Sin código postal';
        const deliveryDate = cart.deliveryDate || 'Sin fecha de entrega';
        const quantity = cart.quantity || 1;  // Asegúrate de obtener la cantidad desde el carrito

        const dataToWrite = [
          payment.paymentId,
          payment.status,
          payment.total,
          payment.external_reference,
          payment.dateCreated.toISOString(),
          sale.personalData.name,
          sale.personalData.surname,
          sale.personalData.email,
          sale.personalData.cel,
          sale.personalData.address,
          sale.personalData.altura,
          sale.personalData.city,
          sale.personalData.streets,
          sale.personalData.contact,
          sale.personalData.notes,
          postalCode,
          deliveryDate,
          quantity  // Añadir la cantidad al escribir los datos
        ];

        console.log('Escribiendo los siguientes datos en Google Sheets:', dataToWrite);
        await writeToSheet([dataToWrite]);
        console.log('Datos escritos exitosamente en Google Sheets.');

        // Guardamos la cantidad correcta en ConsolidatedSaleData
        const consolidatedData = new ConsolidatedSaleData({
          paymentId: payment.paymentId,
          external_reference: payment.external_reference,
          status: payment.status,
          dateCreated: payment.dateCreated,
          total: payment.total,
          personalData: sale.personalData,
          postalCode,
          deliveryDate,
          quantity,  // Almacenar la cantidad en ConsolidatedSaleData
          emailSent: false,  // Inicialmente, emailSent es false
        });

        await consolidatedData.save();
        console.log('Datos consolidados guardados correctamente.');

        payment.isSynced = true;
        await payment.save();
        console.log(`Pago con ID ${payment.paymentId} marcado como sincronizado.`);
      }
    } else {
      console.log('No se encontraron nuevos pagos no sincronizados en la última hora.');
    }

    // Llamada para enviar correos
    await sendConfirmationEmails();

  } catch (error) {
    console.error('Error al sincronizar pagos con Google Sheets:', error);
  }
};



// Función para enviar correos de confirmación de compra
const sendConfirmationEmails = async () => {
  try {
    const unsentEmails = await ConsolidatedSaleData.find({ emailSent: false });

    if (unsentEmails.length === 0) {
      console.log("No hay correos pendientes de envío.");
      return;
    }

    for (const saleData of unsentEmails) {
      const { personalData, total, postalCode, deliveryDate, paymentId, quantity } = saleData;

      const emailBody = `
        <h1>🥂Tu Artic está en camino🥂</h1>
        <p>Hola ${personalData.name},</p>
        <p>¡Gracias por tu compra! 🥳 Tu Artic está en camino, y no podemos esperar a que lo pruebes. Gracias por confiar en nosotros y ser parte de esta aventura.</p>
        
        <h2>Detalles:</h2>
        <ul>
          <li><strong>Producto:</strong> Artic Gin ${quantity} Botella(s)</li>  <!-- Utilizar la cantidad correcta -->
          <li><strong>Fecha de entrega:</strong> ${deliveryDate}</li>
          <li><strong>Lugar de entrega:</strong> ${personalData.address} ${personalData.altura}, ${personalData.city}</li>
        </ul>

        <p>Estamos seguros de que te va a encantar. Mientras tanto, si tienes alguna duda o simplemente queres hablar de gin, ¡escríbinos!</p>

        <p>¡Salud!</p>
        <p>Artic Team (Estamos arrancando, ¡pero nuestro gin ya juega en las grandes ligas!)</p>

        <br><br>
        <footer>
          <img src="https://res.cloudinary.com/dtu2unujm/image/upload/v1727528460/bienvenidoAArticGinClub_awcxbk.png" alt="Artic Logo" width="150" height="auto" style="display: block; margin: 20px auto;">
        </footer>
      `;

      try {
        const info = await emailHelper(personalData.email, "No Responder 🥂Tu Artic está en camino🥂", "", emailBody);
        console.log(`Correo enviado a ${personalData.email}, Respuesta: ${info.response}`);

        saleData.emailSent = true;
        await saleData.save();
        console.log(`Registro de venta con ID ${paymentId} actualizado: emailSent = true`);

      } catch (error) {
        console.error(`Error al enviar correo a ${personalData.email}:`, error);

        const errorEmailBody = `
          <p>Error al enviar correo a <strong>${personalData.name} ${personalData.surname}</strong>.</p>
          <p><strong>Detalles:</strong></p>
          <ul>
            <li><strong>Correo del cliente:</strong> ${personalData.email}</li>
            <li><strong>Teléfono del cliente:</strong> ${personalData.cel}</li>
            <li><strong>Error:</strong> ${error.message}</li>
          </ul>
          <p>Por favor, verifica enviando un mensaje al número <strong>${personalData.cel}</strong>.</p>
        `;

        try {
          await emailHelper('articgin.dev@gmail.com', `Error con el envío de correo a ${personalData.name}`, "", errorEmailBody);
          console.log(`Correo de error enviado a articgin.dev@gmail.com sobre el fallo en el envío a ${personalData.email}`);
        } catch (error) {
          console.error(`Error al enviar notificación de error:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error al enviar correos de confirmación:", error);
  }
};



// Programar la sincronización cada minuto usando cron
cron.schedule('*/1 * * * *', async () => {
  console.log('Iniciando proceso de sincronización de pagos...');
  await syncPaymentsWithGoogleSheets();
  console.log('Proceso de sincronización completado.');
});
