import * as repo from '../repositories/favoritoRepository.js';

export const alternarFavorito = async (req, res) => {
  try {
    const { idUsuario, idReceita } = req.body;
    const existe = await repo.buscarFavorito(idUsuario, idReceita);

    if (existe) {
      await repo.removerFavorito(idUsuario, idReceita);
      return res.status(200).json({ ativado: false });
    } else {
      await repo.adicionarFavorito(idUsuario, idReceita);
      return res.status(200).json({ ativado: true });
    }
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao alternar favorito' });
  }
};

export const buscarEstatisticasChef = async (req, res) => {
  try {
    const { idChef } = req.params;
    const totalFavoritos = await repo.contarFavoritosDoChef(idChef);
    return res.status(200).json({ totalFavoritos });
  } catch (err) {
    return res.status(500).json({ mensagem: 'Erro ao buscar estatísticas' });
  }
};