import { google } from 'googleapis';
import dotenv from 'dotenv';
import axios from 'axios';

// Cargar variables de entorno
dotenv.config();

// Obtener la URL desde la variable de entorno
const CLOUDINARY_JSON_URL = process.env.CLOUDINARY_JSON_URL;

// Función para obtener credenciales desde Cloudinary
async function getCredentialsFromCloudinary() {
  try {
    const response = await axios.get(CLOUDINARY_JSON_URL);
    return response.data; // Las credenciales son el contenido del archivo JSON
  } catch (error) {
    console.error('Error al obtener el archivo de Cloudinary:', error);
    throw error;
  }
}

// Función asíncrona para inicializar la autenticación de Google y escribir en Google Sheets
async function writeToSheet(values) {
  try {
    // Obtener credenciales desde Cloudinary
    const credentials = await getCredentialsFromCloudinary();

    // Autenticación de Google API
    const auth = new google.auth.GoogleAuth({
      credentials, // Usa las credenciales obtenidas desde Cloudinary
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.VITE_SPREADSHEET_ID;  // Asegúrate de tener esta variable de entorno configurada
    const range = 'Payments!A2'; // Rango donde escribir los datos
    const valueInputOption = 'USER_ENTERED'; // Opciones de entrada de valores

    const resource = { values }; // Carga los valores a escribir

    // Escribir en Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });
    console.log('Datos añadidos a Google Sheets:', response.data);
  } catch (error) {
    console.error('Error al escribir en Google Sheets:', error);
  }
}

// Ejemplo para testear localmente
const testValues = [
  ['Test ID', 'approved', 100, 'TestRef', '2024-09-29T00:00:00.000Z', 'John', 'Doe', 'johndoe@gmail.com']
];

// Llamar a la función de prueba
writeToSheet(testValues);
