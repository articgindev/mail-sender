import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el nombre de archivo y directorio en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importa el archivo JSON con el assertion de tipo JSON
import credentials from './google.json' assert { type: 'json' };

// Inicializar la autenticación utilizando GoogleAuth
const auth = new google.auth.GoogleAuth({
  credentials,  // Usamos el objeto de credenciales directamente
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Función para leer datos de Google Sheets
export async function getSheetData() {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.VITE_SPREADSHEET_ID;
  const range = 'Payments!A:A';  // Solo la primera columna para obtener los paymentId

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    if (rows.length) {
      console.log('Datos obtenidos de Google Sheets:', rows);
      return rows.map(row => row[0]);  // Devolver solo los paymentId
    } else {
      console.log('No se encontraron datos en Google Sheets.');
      return [];
    }
  } catch (error) {
    console.error('Error al leer de Google Sheets:', error);
    return [];
  }
}
