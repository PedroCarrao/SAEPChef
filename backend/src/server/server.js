import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir a pasta anexos_prova como arquivos estáticos para exibir as imagens
app.use('/anexos_prova', express.static(path.join(__dirname, 'anexos_prova')));

// Rota de Login
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await pool.query(
      'SELECT id, nome, nome_usuario, email, tipo, imagem_usuario FROM public.tb_usuario WHERE email = $1 AND senha = $2',
      [email, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rota para Buscar Receitas (Mural + Busca por Chef/Título)
app.get('/receitas', async (req, res) => {
  try {
    const { busca } = req.query;

    let query = `
      SELECT 
        r.id_receita,
        r.titulo_receita,
        r.origem_receita,
        r.url_imagem,
        r.id_usuario,
        u.nome AS nome_chef,
        u.nome_usuario AS usuario_chef,
        COUNT(f.id_favorito)::int AS total_favoritos
      FROM public.tb_receita r
      JOIN public.tb_usuario u ON r.id_usuario = u.id
      LEFT JOIN public.tb_favorito f ON r.id_receita = f.id_receita
    `;

    const params = [];

    if (busca && busca.trim() !== '') {
      query += ` WHERE LOWER(u.nome_usuario) LIKE LOWER($1) OR LOWER(r.titulo_receita) LIKE LOWER($1)`;
      params.push(`%${busca.trim()}%`);
    }

    query += ` GROUP BY r.id_receita, u.nome, u.nome_usuario ORDER BY r.id_receita ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});

// Rota para Criar Receita (Apenas Chefs)
app.post('/receitas', async (req, res) => {
  try {
    const { titulo_receita, origem_receita, url_imagem, id_usuario } = req.body;
    
    // Obter o próximo ID disponível
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(id_receita), 0) + 1 AS next_id FROM public.tb_receita');
    const nextId = maxIdResult.rows[0].next_id;

    const now = new Date().toISOString();

    const result = await pool.query(
      `INSERT INTO public.tb_receita (id_receita, titulo_receita, origem_receita, url_imagem, id_usuario, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nextId, titulo_receita, origem_receita, url_imagem, id_usuario, now, now]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar receita:', err);
    res.status(500).json({ error: 'Erro ao cadastrar receita' });
  }
});

// Rota para Deletar Receita
app.delete('/receitas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remover favoritos vinculados primeiro
    await pool.query('DELETE FROM public.tb_favorito WHERE id_receita = $1', [id]);
    await pool.query('DELETE FROM public.tb_receita WHERE id_receita = $1', [id]);

    res.json({ message: 'Receita removida com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar receita:', err);
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

// Rota para Alternar Favorito (Favoritar / Desfavoritar)
app.post('/favoritos', async (req, res) => {
  try {
    const { id_usuario, id_receita } = req.body;

    const exist = await pool.query(
      'SELECT * FROM public.tb_favorito WHERE id_usuario = $1 AND id_receita = $2',
      [id_usuario, id_receita]
    );

    if (exist.rows.length > 0) {
      await pool.query('DELETE FROM public.tb_favorito WHERE id_usuario = $1 AND id_receita = $2', [id_usuario, id_receita]);
      res.json({ status: 'removed' });
    } else {
      const maxIdResult = await pool.query('SELECT COALESCE(MAX(id_favorito), 0) + 1 AS next_id FROM public.tb_favorito');
      const nextId = maxIdResult.rows[0].next_id;
      const now = new Date().toISOString();

      await pool.query(
        'INSERT INTO public.tb_favorito (id_favorito, id_usuario, id_receita, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [nextId, id_usuario, id_receita, now, now]
      );
      res.json({ status: 'added' });
    }
  } catch (err) {
    console.error('Erro ao manipular favoritos:', err);
    res.status(500).json({ error: 'Erro ao manipular favoritos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});