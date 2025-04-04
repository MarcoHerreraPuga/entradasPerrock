import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapter = new JSONFile(join(__dirname, 'boletos.json'));
const db = new Low(adapter);

await db.read();

// Crear directorio para boletos si no existe
const boletosDir = join(__dirname, 'boletos-imprimibles');
if (!fs.existsSync(boletosDir)) {
  fs.mkdirSync(boletosDir);
}

// Función para generar HTML de un boleto
async function generarBoletoHTML(boleto) {
  const qrCode = await QRCode.toDataURL(boleto.id);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .boleto {
          width: 8cm;
          height: 12cm;
          border: 1px solid #000;
          padding: 10px;
          margin: 0 auto;
          font-family: Arial;
          page-break-after: always;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .qr-code {
          text-align: center;
          margin: 10px 0;
        }
        .footer {
          font-size: 10px;
          text-align: center;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="boleto">
        <div class="header">
          <h2>PERROCKERS EN HUANCAYO</h2>
          <p>3 DE MAYO 2024</p>
        </div>
        <p><strong>N°:</strong> ${boleto.id}</p>
        <p><strong>Precio:</strong> S/100.00</p>
        <div class="qr-code">
          <img src="${qrCode}" width="150" height="150">
        </div>
        <p>Válido para 1 persona</p>
        <div class="footer">
          <p>Al escanear este código QR, el boleto será marcado como usado</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generar boletos individuales
for (const boleto of db.data.boletos) {
  const html = await generarBoletoHTML(boleto);
  fs.writeFileSync(join(boletosDir, `boleto-${boleto.id}.html`), html);
}

// Generar archivo con todos los boletos (para impresión masiva)
let allBoletosHTML = '';
for (const boleto of db.data.boletos) {
  allBoletosHTML += await generarBoletoHTML(boleto);
}
fs.writeFileSync(join(boletosDir, 'todos-los-boletos.html'), allBoletosHTML);

console.log('Boletos generados en la carpeta "boletos-imprimibles"');