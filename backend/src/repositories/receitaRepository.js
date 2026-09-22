import { pool } from '../config/db.js';

export const listarTodasReceitas = async () => {
  const query = `
    SELECT r.*, u.nome AS nome_chef, u.nome_usuario AS usuario_chef,
           COUNT(f.id_favorito)::int AS total_favoritos
    FROM public.tb_receita r
    JOIN public.tb_usuario u ON r.id_usuario = u.id
    LEFT JOIN public.tb_favoritar f ON r.id_receita = f.id_receita
    GROUP BY r.id_receita, u.nome, u.nome_usuario
    ORDER BY r.id_receita DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const listarReceitasPorChef = async (idUsuario) => {
  const query = 'SELECT * FROM public.tb_receita WHERE id_usuario = $1';
  const { rows } = await pool.query(query, [idUsuario]);
  return rows;
};

export const criarReceita = async ({ titulo, origem, idUsuario, urlImagem }) => {
  const query = `
    INSERT INTO public.tb_receita (titulo_receita, origem_receita, id_usuario, url_imagem, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW()::text, NOW()::text)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [titulo, origem, idUsuario, urlImagem]);
  return rows[0];
};

export const deletarReceita = async (idReceita) => {
  // Remove favoritos associados primeiro para evitar quebra de FK
  await pool.query('DELETE FROM public.tb_favoritar WHERE id_receita = $1', [idReceita]);
  const query = 'DELETE FROM public.tb_receita WHERE id_receita = $1 RETURNING *';
  const { rows } = await pool.query(query, [idReceita]);
  return rows[0];
};