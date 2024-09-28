import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Asegúrate de reemplazar los saltos de línea correctamente
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  },
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
