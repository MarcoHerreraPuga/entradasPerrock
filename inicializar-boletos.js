import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'boletos.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function inicializarBoletos() {
  await db.read();
  
  if (!db.data?.boletos || db.data.boletos.length < 300) {
    db.data ||= { boletos: [] };
    db.data.boletos = []; // Limpiar si existían algunos
    
    for (let i = 1; i <= 300; i++) {
      db.data.boletos.push({
        id: `PRK-HU-${i.toString().padStart(3, '0')}`,
        usado: false,
        fechaEvento: '2024-05-03'
      });
    }
    
    await db.write();
    console.log('✅ 300 boletos creados correctamente');
  } else {
    console.log('ℹ️ Ya existen 300 boletos en la base de datos');
  }
}

inicializarBoletos().catch(console.error);