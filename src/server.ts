import dotenv from 'dotenv';
import app from './app';
import pool, { initDatabase } from './config/database';

dotenv.config();

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

void start();
