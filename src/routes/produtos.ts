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

/**
 * GET /produtos/:id
 * Retorna um produto pelo id
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Parâmetro "id" deve ser um número inteiro positivo' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nome, descricao, preco, criado_em FROM produtos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar produto' });
  }
});

/**
 * POST /produtos
 * Cria um novo produto
 * Body: { nome: string, descricao?: string, preco: number }
 */
router.post('/', async (req: Request, res: Response) => {
  const { nome, descricao, preco } = req.body;

  // Validação básica
  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ error: 'Campo "nome" é obrigatório e deve ser uma string não vazia' });
  }

  if (preco === undefined || preco === null || isNaN(Number(preco))) {
    return res.status(400).json({ error: 'Campo "preco" é obrigatório e deve ser um número' });
  }

  const precoNum = Number(preco);
  if (precoNum < 0) {
    return res.status(400).json({ error: 'Campo "preco" não pode ser negativo' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING id, nome, descricao, preco, criado_em',
      [nome.trim(), descricao || null, precoNum]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao criar produto' });
  }
});

export default router;
