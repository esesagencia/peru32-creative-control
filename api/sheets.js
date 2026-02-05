// api/sheets.js
// Vercel Serverless Function para manejar operaciones de Google Sheets
// Usa Service Account para autenticación segura

import { google } from 'googleapis';

// Configurar Google Auth con Service Account
function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.G_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || process.env.G_KEY)?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Credenciales de Google no configuradas');
  }

  return new google.auth.JWT({
    email: email,
    key: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// Helper: Encontrar fila por ID
async function findRowByID(sheets, spreadsheetId, sheetName, creativeId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    const index = rows.findIndex((row, idx) => idx > 0 && row[0] === creativeId);

    return index !== -1 ? index + 1 : null;
  } catch (error) {
    console.error('Error buscando fila:', error);
    return null;
  }
}

// Handler principal
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const { action, spreadsheetId, sheetName, data } = req.body;
    console.log('API Request:', { action, spreadsheetId, sheetName });

    switch (action) {
      case 'append': {
        // Añadir nueva fila
        const { rowData } = data;
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:K`,
          valueInputOption: 'RAW',
          resource: {
            values: [rowData],
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Fila añadida correctamente',
          data: response.data,
        });
      }

      case 'update': {
        // Actualizar fila existente
        const { creativeId, rowData } = data;

        // Buscar fila
        const rowNumber = await findRowByID(sheets, spreadsheetId, sheetName, creativeId);

        if (!rowNumber) {
          // Si no existe, añadir nueva
          const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:K`,
            valueInputOption: 'RAW',
            resource: {
              values: [rowData],
            },
          });

          return res.status(200).json({
            success: true,
            message: 'Fila creada (no existía previamente)',
            data: appendResponse.data,
          });
        }

        // Actualizar fila existente
        const range = `${sheetName}!A${rowNumber}:K${rowNumber}`;
        const response = await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          resource: {
            values: [rowData],
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Fila actualizada correctamente',
          rowNumber,
          data: response.data,
        });
      }

      case 'read': {
        // Leer datos del sheet
        const { range } = data;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: range || `${sheetName}!A:K`,
        });

        return res.status(200).json({
          success: true,
          data: response.data.values || [],
        });
      }

      case 'create_sheet': {
        // Crear nuevo Google Sheet
        const { title } = data;

        const response = await sheets.spreadsheets.create({
          resource: {
            properties: {
              title,
            },
            sheets: [
              {
                properties: {
                  title: sheetName || 'Creative_Tracker',
                },
              },
            ],
          },
        });

        const newSpreadsheetId = response.data.spreadsheetId;

        // Añadir headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: newSpreadsheetId,
          range: `${sheetName || 'Creative_Tracker'}!A1:K1`,
          valueInputOption: 'RAW',
          resource: {
            values: [[
              'ID',
              'Persona',
              'Fase',
              'Headline',
              'Subline',
              'CTA',
              'Visual_Desc',
              'Template',
              'Estado',
              'Fecha_Creacion',
              'URL_Canva',
            ]],
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Google Sheet creado correctamente',
          spreadsheetId: newSpreadsheetId,
          url: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`,
        });
      }

      case 'share': {
        // Compartir sheet con emails del equipo
        const { emails } = data;
        const drive = google.drive({ version: 'v3', auth });

        const sharePromises = emails.map(email =>
          drive.permissions.create({
            fileId: spreadsheetId,
            requestBody: {
              type: 'user',
              role: 'writer',
              emailAddress: email,
            },
            sendNotificationEmail: true,
          })
        );

        await Promise.all(sharePromises);

        return res.status(200).json({
          success: true,
          message: `Sheet compartido con ${emails.length} usuarios`,
        });
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Acción no válida',
        });
    }
  } catch (error) {
    console.error('Error en API de Google Sheets:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido',
      details: error.toString(),
    });
  }
}
