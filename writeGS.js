import { google } from 'googleapis';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

// Configura Cloudinary con tus credenciales de API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para generar una URL firmada de Cloudinary para acceder al archivo JSON
const getSignedUrl = () => {
  try {
    const signedUrl = cloudinary.url('google_uv3o9e.json', {
      resource_type: 'raw',
      type: 'authenticated', // Requiere autenticación para acceder
      sign_url: true,        // Firma la URL
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generando la URL firmada:', error);
    throw error;
  }
};

// Función para obtener las credenciales de Google desde la URL firmada de Cloudinary
const getGoogleCredentials = async () => {
  try {
    const signedUrl = getSignedUrl();

    // Descargar el archivo JSON usando la URL firmada
    const { data } = await axios.get(signedUrl);
    return data;
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
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
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
      spreadsheetId: process.env.VITE_SPREADSHEET_ID, // ID de la hoja de cálculo de Google
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: data,
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
