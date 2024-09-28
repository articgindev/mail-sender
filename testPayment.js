import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js'; // Asegúrate de que el modelo está bien referenciado

dotenv.config();

// URL de conexión a MongoDB
const mongoDBURL = process.env.MONGODB_URL;

// Conexión a la base de datos
mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');

    // Simular datos de pago de prueba
    const paymentData = {
      id: '1r33CcDd',              // ID de prueba
      status: 'approved',                  // Estado de prueba
      date_created: new Date(),            // Fecha actual
      transaction_amount: 1000,            // Monto de prueba
      external_reference: 'test_reference', // Referencia de prueba
      personalData: {
        name: 'John Doe',                  // Nombre de prueba
        email: 'john.doe@example.com',     // Email de prueba
        address: '123 Main St',            // Dirección de prueba
        city: 'Sample City',               // Ciudad de prueba
        postalCode: '12345'                // Código postal de prueba
      }
    };

    // Crear un nuevo registro del pago en la base de datos
    const newPayment = new Payment({
      paymentId: paymentData.id,
      status: paymentData.status,
      dateCreated: paymentData.date_created,
      total: paymentData.transaction_amount,
      external_reference: paymentData.external_reference || 'No reference',
      personalData: paymentData.personalData, // Añadir los datos personales
    });

    newPayment.save()
      .then(() => {
        console.log('Pago de prueba creado y guardado exitosamente.');
        mongoose.connection.close(); // Cerrar la conexión a la base de datos después de guardar
      })
      .catch((error) => {
        console.error('Error guardando el pago de prueba:', error);
        mongoose.connection.close();
      });
  })
  .catch((error) => {
    console.error('Error conectando a la base de datos:', error);
  });
