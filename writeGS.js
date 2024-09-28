import { google } from 'googleapis';


// Importa el archivo JSON con el assertion de tipo JSON
import credentials from './google.json' assert { type: 'json' };

const auth = new google.auth.GoogleAuth({
  credentials,  // Ya no necesitas el keyFile, puedes pasar el objeto de credenciales directamente
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const writeToSheet = async (data) => {
  const request = {
    spreadsheetId: process.env.VITE_SPREADSHEET_ID,
    range: 'Sheet1!A1', // Ajusta esto a tu necesidad
    valueInputOption: 'RAW',
    resource: {
      values: data,
    },
  };

  try {
    await sheets.spreadsheets.values.append(request);
    console.log('Datos escritos en Google Sheets.');
  } catch (error) {
    console.error('Error escribiendo en Google Sheets:', error);
    throw error;
  }
};
