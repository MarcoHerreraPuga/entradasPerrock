import express from 'express';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de la base de datos
const adapter = new JSONFile(path.join(__dirname, 'boletos.json'));
const db = new Low(adapter);

// Inicializar la aplicación
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar base de datos
await db.read();
db.data ||= { boletos: [] };

// API para validar boletos
app.post('/api/validar', async (req, res) => {
  const { codigo } = req.body;
  
  if (!codigo) {
    return res.status(400).json({ valido: false, mensaje: 'Código no proporcionado' });
  }

  const boleto = db.data.boletos.find(b => b.id === codigo);

  if (!boleto) {
    return res.json({ valido: false, mensaje: 'Boleto no existe' });
  }

  const fechaEvento = new Date(boleto.fechaEvento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (hoy > fechaEvento) {
    return res.json({ valido: false, mensaje: 'Evento ya terminó' });
  }

  if (boleto.usado) {
    return res.json({ valido: false, mensaje: 'Boleto ya fue usado' });
  }

  // Marcar como usado
  boleto.usado = true;
  await db.write();

  res.json({ valido: true, mensaje: 'Boleto válido', boleto });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});