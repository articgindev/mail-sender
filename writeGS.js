import { google } from 'googleapis';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

// Configura Cloudinary con tus credenciales de API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Asegúrate de tener estas variables de entorno en Vercel
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para obtener las credenciales de Google desde Cloudinary
const getGoogleCredentials = async () => {
  try {
    // Usa la URL directa de Cloudinary para obtener el archivo JSON de credenciales
    const url = 'https://res.cloudinary.com/dtu2unujm/raw/upload/v1727559053/google_uv3o9e.json'; // Tu URL en Cloudinary

    // Descargar el archivo JSON con las credenciales
    const { data } = await axios.get(url);
    return data; // Retorna las credenciales descargadas
  } catch (error) {
    console.error('Error obteniendo credenciales de Google desde Cloudinary:', error);
    throw error;
  }
};

// Autenticación con Google usando las credenciales descargadas
const authenticateGoogle = async () => {
  try {
    const credentials = await getGoogleCredentials();

    const auth = new google.auth.GoogleAuth({
      credentials,  // Usa las credenciales obtenidas desde Cloudinary
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth; // Retorna el objeto de autenticación
  } catch (error) {
    console.error('Error autenticando con Google:', error);
    throw error;
  }
};

// Configura Google Sheets API
const sheets = async () => {
  const auth = await authenticateGoogle();
  return google.sheets({ version: 'v4', auth });
};

// Función para escribir datos en Google Sheets
export const writeToSheet = async (data) => {
  try {
    const sheetsService = await sheets();

    const request = {
      spreadsheetId: process.env.VITE_SPREADSHEET_ID,  // ID de la hoja de cálculo de Google
      range: 'Sheet1!A1', // Ajusta esto según el rango que desees usar
      valueInputOption: 'RAW',
      resource: {
        values: data,  // Los datos que quieres escribir
      },
    };

    // Usar la API de Google Sheets para añadir datos
    await sheetsService.spreadsheets.values.append(request);
    console.log('Datos escritos en Google Sheets correctamente.');
  } catch (error) {
    console.error('Error escribiendo en Google Sheets:', error);
    throw error;
  }
};
