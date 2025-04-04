import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'boletos.json');

// Configuración de la base de datos
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initializeDB() {
  await db.read();
  
  // Crear 300 boletos si no existen
  if (!db.data?.boletos?.length) {
    db.data ||= { boletos: [] };
    
    for (let i = 1; i <= 300; i++) {
      db.data.boletos.push({
        id: `PRK-HU-${i.toString().padStart(3, '0')}`,
        usado: false,
        fechaEvento: '2024-05-03'
      });
    }
    
    await db.write();
    console.log('Base de datos inicializada con 300 boletos');
  } else {
    console.log('La base de datos ya contiene boletos');
  }
}

initializeDB().catch(console.error);