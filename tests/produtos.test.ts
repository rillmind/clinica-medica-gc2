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
});
