import { google } from 'googleapis';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();


// Importa el archivo JSON con el assertion de tipo JSON
import credentials from './google.json' assert { type: 'json' };

const auth = new google.auth.GoogleAuth({
  credentials,  // Ya no necesitas el keyFile, puedes pasar el objeto de credenciales directamente
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Función asíncrona para apendear datos en la hoja de Google Sheets
export async function writeToSheet(values) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.VITE_SPREADSHEET_ID;
  const range = 'Payments!A2';
  const valueInputOption = 'USER_ENTERED';

  const resource = { values };

  try {
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
