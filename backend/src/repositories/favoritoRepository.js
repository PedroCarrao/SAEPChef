import { pool } from '../config/db.js';

export const buscarFavorito = async (idUsuario, idReceita) => {
  const query = 'SELECT * FROM public.tb_favoritar WHERE id_usuario = $1 AND id_receita = $2';
  const { rows } = await pool.query(query, [idUsuario, idReceita]);
  return rows[0];
};

export const adicionarFavorito = async (idUsuario, idReceita) => {
  const query = `
    INSERT INTO public.tb_favoritar (id_usuario, id_receita, created_at, updated_at)
    VALUES ($1, $2, NOW()::text, NOW()::text)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [idUsuario, idReceita]);
  return rows[0];
};

export const removerFavorito = async (idUsuario, idReceita) => {
  const query = 'DELETE FROM public.tb_favoritar WHERE id_usuario = $1 AND id_receita = $2 RETURNING *';
  const { rows } = await pool.query(query, [idUsuario, idReceita]);
  return rows[0];
};

export const contarFavoritosDoChef = async (idChef) => {
  const query = `
    SELECT COUNT(f.id_favorito)::int AS total_favoritos
    FROM public.tb_favoritar f
    JOIN public.tb_receita r ON f.id_receita = r.id_receita
    WHERE r.id_usuario = $1
  `;
  const { rows } = await pool.query(query, [idChef]);
  return rows[0]?.total_favoritos || 0;
};