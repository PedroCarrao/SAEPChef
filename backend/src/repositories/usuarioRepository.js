import { pool } from '../config/db.js';

export const buscarUsuarioPorEmail = async (email) => {
  const query = 'SELECT * FROM public.tb_usuario WHERE email = $1';
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

export const buscarChefPorNomeUsuario = async (nomeUsuario) => {
  const query = 'SELECT * FROM public.tb_usuario WHERE nome_usuario = $1 AND tipo = $2';
  const { rows } = await pool.query(query, [nomeUsuario, 'chef']);
  return rows[0];
};