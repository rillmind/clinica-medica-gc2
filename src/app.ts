import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/produtos', produtosRoutes);

export default app;
