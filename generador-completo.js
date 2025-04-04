import fs from 'fs';
import QRCode from 'qrcode';

// Crear directorio si no existe
const outputDir = 'boletos-imprimibles';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Generar 300 boletos
for (let i = 1; i <= 300; i++) {
  const id = `PRK-HU-${i.toString().padStart(3, '0')}`;
  const qrCode = await QRCode.toDataURL(id);
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      .boleto {
        width: 8cm; height: 12cm;
        border: 1px solid #000;
        padding: 10px;
        margin: 0 auto;
        font-family: Arial;
        page-break-after: always;
      }
      .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
      .qr-code { text-align: center; margin: 10px 0; }
      .footer { font-size: 10px; text-align: center; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="boleto">
      <div class="header">
        <h2>PERROCKERS EN HUANCAYO</h2>
        <p>3 DE MAYO 2024</p>
      </div>
      <p><strong>N°:</strong> ${id}</p>
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
  </html>`;
  
  fs.writeFileSync(`${outputDir}/boleto-${id}.html`, html);
  console.log(`Generado boleto ${id}`);
}

console.log('✅ Todos los boletos generados correctamente');

/* para ejecutar el código:
utiliza los siguientes comandos en la terminal:
npm install qrcode
node generador-completo.js */