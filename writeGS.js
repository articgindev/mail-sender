import { google } from 'googleapis';

// Parse the credentials from the environment variable
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const writeToSheet = async (data) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.VITE_SPREADSHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: data,
      },
    });
    console.log('Data written to Google Sheets successfully');
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
  }
};
