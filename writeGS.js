import { google } from 'googleapis';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Credenciales de Google en constante
// const credentials = {
//   "type": "service_account",
//   "project_id": "web-artic",
//   "private_key_id": "a5ba27182dc75e5eb9a8bfa9481e733b2dd755cb",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQClko585kZvHTMW\nw/sptJd+0JfwLjw2atF06ZKfbkhhytYvAzeLCdS8XhZmScFe1/dhvtcU2b5JeAfs\nT6MoH+IU7lbGVPZ8vOv9TZmvkoe+YrlUF3fTEqjdkx7zC2t1aJqRlPbL3sWr0ttg\n6ZoabHDfkmskIRNPBOOsHPFgiHCtLnEIVReHCVJJayql97O7twkpd9PdPiF3FXdq\n1oAOJP3jqvLqCSNPjKDfqucdFU2KrT6FscdTiNitvhWyTlZIRBlW3ANnx7I9VQZV\nxAEiNEG2fDqxPAmypa+nJ/hrZNstICXWhYqZHcoyr8McaRSC7dW9GGAO89mA9Tge\nxuzL/y2HAgMBAAECggEAEEn4UapX8JOHVKyIN6SoKNY9tGfgDZx5qc5W2e+AGHrb\nknl3C+s2Lif1fS+xYfLOSCP9xfPcCB9SbDmze/2TAOsnx1BRhZkSgHOTdJXuW9kb\nkX3TkITr7wyLxW5wrnbRihQFKa5rdQmEAqdIvWPAwQYHG2FTpHj/Kw4X4x7ZMvhP\nqp4xDBeRFDxLowdMHPe6IZAFP+EiQ5Ih2LR4DRSA4Fo+18mdm52PICjC+/ZE+1qS\nMiYcrZ8mO7QroRG3S4mp7W+9saAfaaroV/+o5rahdEfvwXUJxkL4Zzj4DIjiTD/6\nIN4f2U7DCAcNRz8/1bgFnEhF2zl33eAQXhMco/XrSQKBgQDSaYwyNlBm+uLJRz2E\nSKHtpY4QGyWY92vue8b7V5I07eRTeruoP24QZvT3BbXx2qO5lDzPvzqGlES/oRZC\nG6QZr4U/ZYKG2cScmd0cnuXfqcg8ZdG2p6SbwCquu9sW/71n7Ie0ti29ywM82OCQ\no7aEmVcZGpU9WV7TiiXxg5Q5jwKBgQDJcfuh8anN89nNGPe5E9Xzx1Old43B54kU\nPxL7gnAp6ANdOZArgRMKTHGZbPJ9CQPCk7NPsivSkmZ7mV/tsJZU78tf/xnejDCV\ndAkA4yxje4Zj7K/HlgXLz0VDRey39mwyUPoiYacdvqUloQnFw6BnYeX/w1cpX2+N\nLHuM/52giQKBgDXDtokWC9FkhhJ8W6GzlXzN8tD2vtKpVjDn+945cCiKKO+TyuOg\n4ZTbWfjMwsL75R4EXM2QxXmh5Tc6CB/4RCQ0D041t/aRKoYBYthvWbme/oVAVyff\nClap8b4YTlFAI7usWri4XFPEzhz8JdWPn5GeRP0rJ7s3XN2czTk7L+LNAoGAMYGL\nn67uVij5e8gJCTjwuapgyidpdR/btlgR6DGUMxhLy1tcLPTZowxKVrRJm6TdgbIe\nvRVCY8uK2BFHW/ir2U/dIUhmKSU2w2Py2n7557DxxBjk0h3yarYThYbnuAYdbPgt\noMly8oJpv6el6S48e2u5xHNTNl234m/uJSakrFECgYEAzy4w4yCg44T43rZRYKH2\njQPKg0GpA8CNTWmHJHGe5Z0z2t32KKAelOSq9kBYMoCl+OGX0y1R2AKcTzx1nr3p\nPtWhZCDDQwXXPysnTMZspvHZ6MrHGXp5mzHKoamkvSha7TOtj75/gGL7LuMxnVAq\n6orguBM+wHfGBk/fMoQa9+I=\n-----END PRIVATE KEY-----\n",
//   "client_email": "id-artic@web-artic.iam.gserviceaccount.com",
//   "client_id": "100344301593881156249",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/id-artic%40web-artic.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// };
import credentials from './google.json' assert { type: 'json' };


// Autenticación de Google API
const auth = new google.auth.GoogleAuth({
  credentials, // Usa la constante con las credenciales
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Función asíncrona para escribir datos en Google Sheets
export async function writeToSheet(values) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.VITE_SPREADSHEET_ID;  // Asegúrate de tener esta variable de entorno configurada
  const range = 'Payments!A2'; // Rango donde escribir los datos
  const valueInputOption = 'USER_ENTERED'; // Opciones de entrada de valores

  const resource = { values }; // Carga los valores a escribir

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

// Ejemplo para testear localmente
const testValues = [
  ['Test ID', 'approved', 100, 'TestRef', '2024-09-29T00:00:00.000Z', 'John', 'Doe', 'johndoe@gmail.com']
];

// Llamar a la función de prueba
writeToSheet(testValues);
