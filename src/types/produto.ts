export interface Produto {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: number;
  criado_em?: string;
}

export interface CreateProdutoDTO {
  nome: string;
  descricao?: string;
  preco: number;
}
