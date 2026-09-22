import * as repo from '../repositories/receitaRepository.js';

export const listar = async (req, res) => {
  try {
    const receitas = await repo.listarTodasReceitas();
    return res.status(200).json(receitas);
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao buscar receitas' });
  }
};

export const listarPorChef = async (req, res) => {
  try {
    const { idChef } = req.params;
    const receitas = await repo.listarReceitasPorChef(idChef);
    return res.status(200).json(receitas);
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao buscar receitas do chef' });
  }
};

export const criar = async (req, res) => {
  try {
    const { titulo, origem, idUsuario, urlImagem } = req.body;
    const novaReceita = await repo.criarReceita({ titulo, origem, idUsuario, urlImagem });
    return res.status(201).json(novaReceita);
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao cadastrar receita' });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await repo.deletarReceita(id);
    return res.status(200).json({ mensagem: 'Receita excluída com sucesso' });
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao deletar receita' });
  }
};