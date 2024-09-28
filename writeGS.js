import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const writeToSheet = async (data) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.VITE_SPREADSHEET_ID,
      range: 'Payments!A1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: data },
    });
    console.log('Datos añadidos a Google Sheets:', response.data.updates);
    return response.data.updates;
  } catch (error) {
    console.error('Error escribiendo en Google Sheets:', error);
    throw error;
  }
};
