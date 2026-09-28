import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

describe('Rotas de Produtos (/produtos)', () => {
  const mockedPool = pool as unknown as { query: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /produtos', () => {
    it('deve retornar 200 e a lista de produtos com sucesso', async () => {
      const mockProdutos = [
        {
          id: 1,
          nome: 'Dipirona 500mg',
          descricao: 'Analgésico e antitérmico',
          preco: '12.50',
          criado_em: '2026-09-01T00:00:00.000Z',
        },
      ];

      mockedPool.query.mockResolvedValueOnce({ rows: mockProdutos });

      const response = await request(app).get('/produtos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProdutos);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT id, nome, descricao, preco, criado_em FROM produtos ORDER BY id ASC'
      );
    });

    it('deve retornar 500 quando ocorrer erro na consulta ao banco', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Erro de conexão com o banco'));

      const response = await request(app).get('/produtos');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erro interno ao buscar produtos' });
    });
  });

  describe('POST /produtos', () => {
    it('deve retornar 201 e criar um produto com descrição informada', async () => {
      const novoProduto = {
        nome: 'Ibuprofeno 400mg',
        descricao: 'Anti-inflamatório',
        preco: 15.75,
      };

      const produtoCriado = {
        id: 2,
        ...novoProduto,
        preco: '15.75',
        criado_em: '2026-09-01T00:00:00.000Z',
      };

      mockedPool.query.mockResolvedValueOnce({ rows: [produtoCriado] });

      const response = await request(app).post('/produtos').send(novoProduto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(produtoCriado);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO produtos (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING id, nome, descricao, preco, criado_em',
        ['Ibuprofeno 400mg', 'Anti-inflamatório', 15.75]
      );
    });

    it('deve retornar 201 e criar um produto sem descrição (descricao nula)', async () => {
      const novoProduto = {
        nome: 'Paracetamol 750mg',
        preco: 9.9,
      };

      const produtoCriado = {
        id: 3,
        nome: 'Paracetamol 750mg',
        descricao: null,
        preco: '9.90',
        criado_em: '2026-09-01T00:00:00.000Z',
      };

      mockedPool.query.mockResolvedValueOnce({ rows: [produtoCriado] });

      const response = await request(app).post('/produtos').send(novoProduto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(produtoCriado);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO produtos (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING id, nome, descricao, preco, criado_em',
        ['Paracetamol 750mg', null, 9.9]
      );
    });

    it('deve retornar 400 quando o campo nome não for fornecido', async () => {
      const response = await request(app).post('/produtos').send({ preco: 10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "nome" é obrigatório e deve ser uma string não vazia',
      });
    });

    it('deve retornar 400 quando o campo nome for de tipo inválido', async () => {
      const response = await request(app).post('/produtos').send({ nome: 123, preco: 10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "nome" é obrigatório e deve ser uma string não vazia',
      });
    });

    it('deve retornar 400 quando o campo nome for uma string vazia ou apenas espaços', async () => {
      const response = await request(app).post('/produtos').send({ nome: '   ', preco: 10 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "nome" é obrigatório e deve ser uma string não vazia',
      });
    });

    it('deve retornar 400 quando o campo preco for indefinido', async () => {
      const response = await request(app).post('/produtos').send({ nome: 'Dipirona' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "preco" é obrigatório e deve ser um número',
      });
    });

    it('deve retornar 400 quando o campo preco for nulo', async () => {
      const response = await request(app).post('/produtos').send({ nome: 'Dipirona', preco: null });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "preco" é obrigatório e deve ser um número',
      });
    });

    it('deve retornar 400 quando o campo preco for NaN', async () => {
      const response = await request(app).post('/produtos').send({ nome: 'Dipirona', preco: 'abc' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "preco" é obrigatório e deve ser um número',
      });
    });

    it('deve retornar 400 quando o campo preco for negativo', async () => {
      const response = await request(app).post('/produtos').send({ nome: 'Dipirona', preco: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Campo "preco" não pode ser negativo',
      });
    });

    it('deve retornar 500 quando ocorrer erro inesperado no banco ao criar produto', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Falha ao inserir no banco'));

      const response = await request(app).post('/produtos').send({
        nome: 'Amoxicilina 500mg',
        preco: 25.0,
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Erro interno ao criar produto',
      });
    });
  });

  describe('GET /produtos/:id', () => {
    it('deve retornar 200 e o produto quando existir', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Dipirona 500mg',
        descricao: 'Analgésico e antitérmico',
        preco: '12.50',
        criado_em: '2026-09-01T00:00:00.000Z',
      };

      mockedPool.query.mockResolvedValueOnce({ rows: [mockProduto] });

      const response = await request(app).get('/produtos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduto);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT id, nome, descricao, preco, criado_em FROM produtos WHERE id = $1',
        [1]
      );
    });

    it('deve retornar 404 quando o produto não existir', async () => {
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/produtos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Produto não encontrado' });
    });

    it('deve retornar 400 quando o id for inválido (texto)', async () => {
      const response = await request(app).get('/produtos/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Parâmetro "id" deve ser um número inteiro positivo',
      });
      expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando o id for zero ou negativo', async () => {
      const responseZero = await request(app).get('/produtos/0');
      expect(responseZero.status).toBe(400);

      const responseNeg = await request(app).get('/produtos/-5');
      expect(responseNeg.status).toBe(400);
    });

    it('deve retornar 500 quando ocorrer erro no banco ao buscar por id', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Falha no banco'));

      const response = await request(app).get('/produtos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erro interno ao buscar produto' });
    });
  });

  describe('DELETE /produtos/:id', () => {
    it('deve retornar 204 e remover o produto quando existir', async () => {
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1, rows: [] });

      const response = await request(app).delete('/produtos/1');

      expect(response.status).toBe(204);
      expect(response.text).toBe('');
      expect(mockedPool.query).toHaveBeenCalledWith('DELETE FROM produtos WHERE id = $1', [1]);
    });

    it('deve retornar 404 quando o produto não existir', async () => {
      mockedPool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const response = await request(app).delete('/produtos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Produto não encontrado' });
    });

    it('deve retornar 400 quando o id for inválido (texto)', async () => {
      const response = await request(app).delete('/produtos/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Parâmetro "id" deve ser um número inteiro positivo',
      });
      expect(mockedPool.query).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando o id for zero ou negativo', async () => {
      const responseZero = await request(app).delete('/produtos/0');
      expect(responseZero.status).toBe(400);

      const responseNeg = await request(app).delete('/produtos/-2');
      expect(responseNeg.status).toBe(400);
    });

    it('deve retornar 500 quando ocorrer erro no banco ao remover', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Falha no banco'));

      const response = await request(app).delete('/produtos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erro interno ao remover produto' });
    });
  });
});
