import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

/**
 * GET /produtos
 * Retorna lista de produtos cadastrados
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, descricao, preco, criado_em FROM produtos ORDER BY id ASC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

export default router;
