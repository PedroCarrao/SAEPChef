const API_URL = 'http://localhost:3000/api';

let usuarioLogado = null;
let receitasAtuais = [];

// Seleção de elementos do DOM
const btnLoginHeader = document.getElementById('btn-login-header');
const modalLogin = document.getElementById('modal-login');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const formLogin = document.getElementById('form-login');
const inputEmail = document.getElementById('input-email');
const inputSenha = document.getElementById('input-senha');
const erroLogin = document.getElementById('erro-login');

const btnVerPerfil = document.getElementById('btn-ver-perfil');
const imgPerfilHeader = document.getElementById('img-perfil-header');
const nomeUsuarioHeader = document.getElementById('nome-usuario-header');

const drawerChef = document.getElementById('drawer-chef');
const btnFecharDrawer = document.getElementById('btn-fechar-drawer');
const totalFavoritosChef = document.getElementById('total-favoritos-chef');
const totalReceitasChef = document.getElementById('total-receitas-chef');

const formBusca = document.getElementById('form-busca');
const inputBusca = document.getElementById('input-busca');
const erroBusca = document.getElementById('erro-busca');

const gridReceitas = document.getElementById('grid-receitas');
const secaoCadastroReceita = document.getElementById('secao-cadastro-receita');
const formCadastroReceita = document.getElementById('form-cadastro-receita');
const inputTituloReceita = document.getElementById('input-titulo-receita');
const inputOrigemReceita = document.getElementById('input-origem-receita');
const inputImagemReceita = document.getElementById('input-imagem-receita');
const listaSuasReceitas = document.getElementById('lista-suas-receitas');

document.addEventListener('DOMContentLoaded', () => {
  carregarReceitas();
  configurarEventos();
});

function configurarEventos() {
  if (btnLoginHeader) {
    btnLoginHeader.addEventListener('click', () => {
      if (usuarioLogado) {
        fazerLogout();
      } else {
        abrirModalLogin();
      }
    });
  }

  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModalLogin);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModalLogin);

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      await autenticarUsuario();
    });
  }

  if (btnVerPerfil) {
    btnVerPerfil.addEventListener('click', async () => {
      if (!usuarioLogado || usuarioLogado.tipo !== 'chef') return;
      await carregarEstatisticasChef();
      if (drawerChef) drawerChef.classList.add('ativo');
    });
  }

  if (btnFecharDrawer && drawerChef) {
    btnFecharDrawer.addEventListener('click', () => {
      drawerChef.classList.remove('ativo');
    });
  }

  if (formBusca) {
    formBusca.addEventListener('submit', async (e) => {
      e.preventDefault();
      await buscarChef();
    });
  }

  if (formCadastroReceita) {
    formCadastroReceita.addEventListener('submit', async (e) => {
      e.preventDefault();
      await cadastrarReceita();
    });
  }
}

// 1. Renderização do Mural de Receitas
async function carregarReceitas() {
  try {
    const res = await fetch(`${API_URL}/receitas`);
    receitasAtuais = await res.json();
    renderizarMural(receitasAtuais);
  } catch (err) {
    console.error('Erro ao carregar receitas:', err);
  }
}

function renderizarMural(receitas) {
  if (!gridReceitas) return;
  gridReceitas.innerHTML = '';
  if (erroBusca) erroBusca.textContent = '';

  if (receitas.length === 0) {
    gridReceitas.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhuma receita encontrada.</p>';
    return;
  }

  receitas.forEach(receita => {
    const card = document.createElement('div');
    card.className = 'card-receita';

    const corEstrela = receita.favoritado_por_mim ? '#F5A623' : '#01C229';

    card.innerHTML = `
      <div class="container-imagem">
        <img src="${receita.url_imagem}" alt="${receita.titulo_receita}" class="img-receita">
        <div class="tooltip-hover">
          <p>Receita publicada por @${receita.usuario_chef || 'chef'}</p>
          <p>Origem: ${receita.origem_receita}</p>
        </div>
      </div>
      <div class="card-info">
        <h3>${receita.titulo_receita}</h3>
        <div class="card-favoritos">
          <button class="btn-favoritar" onclick="alternarFavorito(${receita.id_receita})">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${corEstrela}">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
          <span>${receita.total_favoritos || 0}</span>
        </div>
      </div>
    `;
    gridReceitas.appendChild(card);
  });
}

// 2. Sistema de Login
function abrirModalLogin() {
  if (erroLogin) erroLogin.textContent = '';
  if (modalLogin) modalLogin.classList.add('ativo');
}

function fecharModalLogin() {
  if (modalLogin) modalLogin.classList.remove('ativo');
}

async function autenticarUsuario() {
  const email = inputEmail ? inputEmail.value.trim() : '';
  const senha = inputSenha ? inputSenha.value.trim() : '';

  if (!email || !senha) {
    if (erroLogin) erroLogin.textContent = 'Preencha todos os campos.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    if (!res.ok) {
      const data = await res.json();
      if (erroLogin) erroLogin.textContent = data.mensagem || 'Usuário não encontrado ou senha incorreta';
      return;
    }

    usuarioLogado = await res.json();
    atualizarInterfaceUsuario();
    fecharModalLogin();
  } catch (err) {
    if (erroLogin) erroLogin.textContent = 'Erro ao conectar ao servidor.';
  }
}

function atualizarInterfaceUsuario() {
  if (nomeUsuarioHeader) nomeUsuarioHeader.textContent = `@${usuarioLogado.nome_usuario}`;
  if (imgPerfilHeader && usuarioLogado.imagem_usuario) {
    imgPerfilHeader.src = usuarioLogado.imagem_usuario;
  }
  if (btnLoginHeader) btnLoginHeader.textContent = 'Logout';

  if (usuarioLogado.tipo === 'chef') {
    if (btnVerPerfil) btnVerPerfil.disabled = false;
    if (secaoCadastroReceita) secaoCadastroReceita.style.display = 'block';
    carregarMinhasReceitas();
  } else {
    if (btnVerPerfil) btnVerPerfil.disabled = true;
    if (secaoCadastroReceita) secaoCadastroReceita.style.display = 'none';
  }
}

function fazerLogout() {
  usuarioLogado = null;
  if (nomeUsuarioHeader) nomeUsuarioHeader.textContent = '@SAEPChef';
  if (btnLoginHeader) btnLoginHeader.textContent = 'Login';
  if (btnVerPerfil) btnVerPerfil.disabled = true;
  if (secaoCadastroReceita) secaoCadastroReceita.style.display = 'none';
  carregarReceitas();
}

// 3. Busca Sensível/Flexível por Chef
async function buscarChef() {
  // Limpa espaços extras e o símbolo @ se for digitado
  const termo = inputBusca ? inputBusca.value.trim().toLowerCase().replace('@', '') : '';
  if (erroBusca) erroBusca.textContent = '';

  if (!termo) {
    carregarReceitas();
    return;
  }

  try {
    const resChef = await fetch(`${API_URL}/usuarios/chef/${termo}`);
    if (!resChef.ok) {
      if (erroBusca) erroBusca.textContent = 'Chef não encontrado';
      if (gridReceitas) gridReceitas.innerHTML = '';
      return;
    }

    const chef = await resChef.json();
    const resReceitas = await fetch(`${API_URL}/receitas/chef/${chef.id}`);
    const receitasChef = await resReceitas.json();

    const receitasFormatadas = receitasChef.map(r => ({
      ...r,
      usuario_chef: chef.nome_usuario
    }));

    renderizarMural(receitasFormatadas);
  } catch (err) {
    if (erroBusca) erroBusca.textContent = 'Erro ao pesquisar chef.';
  }
}

// 4. Favoritos
window.alternarFavorito = async function(idReceita) {
  if (!usuarioLogado) {
    abrirModalLogin();
    return;
  }

  try {
    await fetch(`${API_URL}/favoritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario: usuarioLogado.id,
        idReceita: idReceita
      })
    });

    await carregarReceitas();
  } catch (err) {
    console.error('Erro ao alternar favorito:', err);
  }
};

// 5. Painel e Estatísticas do Chef
async function carregarEstatisticasChef() {
  if (!usuarioLogado) return;
  try {
    const resFav = await fetch(`${API_URL}/favoritos/chef/${usuarioLogado.id}`);
    const dataFav = await resFav.json();
    if (totalFavoritosChef) totalFavoritosChef.textContent = `${dataFav.totalFavoritos} Favoritos`;

    const resRec = await fetch(`${API_URL}/receitas/chef/${usuarioLogado.id}`);
    const dataRec = await resRec.json();
    if (totalReceitasChef) totalReceitasChef.textContent = `${dataRec.length} Receitas`;
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  }
}

async function carregarMinhasReceitas() {
  if (!usuarioLogado || !listaSuasReceitas) return;
  try {
    const res = await fetch(`${API_URL}/receitas/chef/${usuarioLogado.id}`);
    const receitas = await res.json();

    listaSuasReceitas.innerHTML = '';
    receitas.forEach(r => {
      const item = document.createElement('div');
      item.className = 'item-sua-receita';
      item.innerHTML = `
        <span>${r.titulo_receita}</span>
        <button onclick="deletarReceita(${r.id_receita})" class="btn-deletar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#F5A623">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      `;
      listaSuasReceitas.appendChild(item);
    });
  } catch (err) {
    console.error('Erro ao carregar receitas do chef:', err);
  }
}

async function cadastrarReceita() {
  const titulo = inputTituloReceita ? inputTituloReceita.value.trim() : '';
  const origem = inputOrigemReceita ? inputOrigemReceita.value.trim() : '';
  const file = inputImagemReceita && inputImagemReceita.files ? inputImagemReceita.files[0] : null;

  if (!titulo || !origem || !file) {
    alert('Preencha todos os campos e selecione uma imagem.');
    return;
  }

  const urlImagem = `assets/images/${file.name}`;

  try {
    const res = await fetch(`${API_URL}/receitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        origem,
        idUsuario: usuarioLogado.id,
        urlImagem
      })
    });

    if (res.ok) {
      if (inputTituloReceita) inputTituloReceita.value = '';
      if (inputOrigemReceita) inputOrigemReceita.value = '';
      if (inputImagemReceita) inputImagemReceita.value = '';
      await carregarReceitas();
      await carregarMinhasReceitas();
      await carregarEstatisticasChef();
    }
  } catch (err) {
    alert('Erro ao cadastrar receita.');
  }
}

window.deletarReceita = async function(idReceita) {
  if (!confirm('Deseja realmente excluir esta receita?')) return;
  try {
    const res = await fetch(`${API_URL}/receitas/${idReceita}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      await carregarReceitas();
      await carregarMinhasReceitas();
      await carregarEstatisticasChef();
    }
  } catch (err) {
    alert('Erro ao excluir receita.');
  }
};