import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de produtos serão registradas aqui
// import produtosRoutes from './routes/produtos';
// app.use('/produtos', produtosRoutes);

export default app;
