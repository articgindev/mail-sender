import { google } from 'googleapis';
import dotenv from 'dotenv';
import axios from 'axios';

// Cargar variables de entorno
dotenv.config();

// Función para obtener credenciales desde la URL almacenada en la variable de entorno
async function getCredentialsFromCloudinary() {
  try {
    const response = await axios.get(process.env.CLOUDINARY_JSON_URL);
    return response.data; // Las credenciales son el contenido del archivo JSON
  } catch (error) {
    console.error('Error al obtener el archivo de Cloudinary:', error);
    throw error;
  }
}

async function initializeAuth() {
  // Obtener credenciales desde la URL
  const credentials = await getCredentialsFromCloudinary();

  // Autenticación de Google API
  return new google.auth.GoogleAuth({
    credentials, // Usa las credenciales obtenidas desde Cloudinary
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Función asíncrona para apendear datos en la hoja de Google Sheets
export async function writeToSheet(values) {
  try {
    const auth = await initializeAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.VITE_SPREADSHEET_ID;
    const range = 'Payments!A2';
    const valueInputOption = 'USER_ENTERED';

    const resource = { values };

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
