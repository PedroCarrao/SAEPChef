import * as repo from '../repositories/usuarioRepository.js';

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await repo.buscarUsuarioPorEmail(email);

    if (!usuario || usuario.senha !== String(senha)) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado ou senha incorreta' });
    }

    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
};

export const buscarChef = async (req, res) => {
  try {
    const { nomeUsuario } = req.params;
    const chef = await repo.buscarChefPorNomeUsuario(nomeUsuario);

    if (!chef) {
      return res.status(404).json({ mensagem: 'Chef não encontrado' });
    }

    return res.status(200).json(chef);
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
};