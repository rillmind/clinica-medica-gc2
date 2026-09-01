import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Fallback: se DATABASE_URL estiver definida, ela tem prioridade.
// Caso contrário usa host/port/user/pass

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do Postgres', err);
});

export async function initDatabase(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela produtos verificada/criada com sucesso');
  } catch (err) {
    console.error('Erro ao inicializar banco de dados', err);
    throw err;
  }
}

export default pool;
