CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados de exemplo
INSERT INTO produtos (nome, descricao, preco) VALUES
('Dipirona 500mg', 'Analgésico e antitérmico', 12.50),
('Paracetamol 750mg', 'Analgésico', 8.90)
ON CONFLICT DO NOTHING;
