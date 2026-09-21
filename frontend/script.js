document.addEventListener("DOMContentLoaded", () => {

    let listaReceitas = [
        { id: 1, titulo: "Risoto de Funghi", imagem: "../anexos_prova/receitas/receita1.jpg", favoritos: 1 },
        { id: 2, titulo: "Receita 2", imagem: "../anexos_prova/receitas/receita2.jpg", favoritos: 1 },
        { id: 3, titulo: "Receita 3", imagem: "../anexos_prova/receitas/receita3.jpg", favoritos: 1 }
    ];


    const usuarioLogado = {
        autenticado: true,
        nome: "SAEPChef",
        foto: "../anexos_prova/imagens_usuarios/chef1.jpg",
        tipo: "chef", 
        totalFavoritos: 12,
        totalReceitas: listaReceitas.length
    };


    const modalLogin = document.getElementById("modal-login");
    const fecharModal = document.getElementById("fechar-modal");
    const btnLoginHeader = document.getElementById("btn-login");
    
    const menuLateral = document.getElementById("menu-lateral");
    const overlayMenu = document.getElementById("overlay-menu");
    const fecharMenu = document.getElementById("fechar-menu");
    const btnVerPerfil = document.getElementById("ver-perfil");
    const infoFavoritos = document.getElementById("info-favoritos");
    const infoReceitas = document.getElementById("info-receitas");
    const btnSuasReceitas = document.getElementById("btn-suas-receitas");

    const campoBusca = document.getElementById("input-busca");
    const btnLupa = document.getElementById("lupa");
    const muralReceitas = document.getElementById("mural_receitas");

    const formCadastro = document.getElementById("form-cadastro-receita");
    const inputTitulo = document.getElementById("titulo-receita");
    const inputOrigem = document.getElementById("origem-receita");
    const inputImagem = document.getElementById("imagem-receita");
    const textoNomeArquivo = document.getElementById("nome-arquivo");
    
    const erroTitulo = document.getElementById("erro-titulo");
    const erroOrigem = document.getElementById("erro-origem");
    const erroImagem = document.getElementById("erro-imagem");

    function renderizarReceitas() {
        muralReceitas.innerHTML = "";

        listaReceitas.forEach((receita) => {
            const card = document.createElement("div");
            card.classList.add("receita_card");
            card.dataset.id = receita.id;

            card.innerHTML = `
                <button class="btn-lixeira" title="Excluir receita">
                    <img src="../anexos_prova/icones/lixeira.svg" alt="Excluir" class="icone-lixeira">
                </button>
                <div class="container-imagem">
                    <img class="imagens_receitas" src="${receita.imagem}" alt="${receita.titulo}">
                    <span class="tooltip">Clique para ver a receita</span>
                </div>
                <h2>${receita.titulo}</h2>
                <div class="favoritos">
                    <img class="icone_coracao" src="../anexos_prova/icones/coracao.svg" alt="Coração">
                    <span>Favoritos: ${receita.favoritos}</span>
                </div>
            `;

            const btnLixeira = card.querySelector(".btn-lixeira");
            btnLixeira.addEventListener("click", () => {
                excluirReceita(receita.id);
            });


            const divFavoritos = card.querySelector(".favoritos");
            divFavoritos.addEventListener("click", () => {
                if (!usuarioLogado.autenticado) {
                    abrirModalLogin();
                    return;
                }
                alternarFavorito(divFavoritos);
            });

            muralReceitas.appendChild(card);
        });

        usuarioLogado.totalReceitas = listaReceitas.length;
        if (infoReceitas) infoReceitas.textContent = `${usuarioLogado.totalReceitas} Receitas`;
    }

    function excluirReceita(id) {
        listaReceitas = listaReceitas.filter(r => r.id !== id);
        renderizarReceitas();
    }

    function alternarFavorito(cardFavorito) {
        const icone = cardFavorito.querySelector(".icone_coracao");
        const spanTexto = cardFavorito.querySelector("span");
        let contagem = parseInt(spanTexto.textContent.replace(/\D/g, "")) || 0;
        const estaFavoritado = icone.classList.contains("favoritado");

        if (!estaFavoritado) {
            icone.src = "../anexos_prova/icones/estrela.svg";
            icone.style.filter = "invert(71%) sepia(85%) saturate(945%) hue-rotate(346deg) brightness(101%) contrast(93%)"; // #F6A823
            icone.classList.add("favoritado");
            spanTexto.textContent = `Favoritos: ${contagem + 1}`;
        } else {
            icone.src = "../anexos_prova/icones/estrela.svg";
            icone.style.filter = "invert(18%) sepia(26%) saturate(1480%) hue-rotate(98deg) brightness(96%) contrast(92%)"; // #1B3C29
            icone.classList.remove("favoritado");
            spanTexto.textContent = `Favoritos: ${Math.max(0, contagem - 1)}`;
        }
    }

    inputImagem.addEventListener("change", () => {
        if (inputImagem.files && inputImagem.files[0]) {
            const ficheiro = inputImagem.files[0];
            const formatosValidos = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
            
            if (!formatosValidos.includes(ficheiro.type)) {
                textoNomeArquivo.textContent = "Nenhum arquivo escolhido";
                erroImagem.textContent = "Formato inválido. Aceitos: JPG, JPEG, PNG, GIF e WEBP.";
                inputImagem.value = "";
            } else {
                textoNomeArquivo.textContent = ficheiro.name;
                erroImagem.textContent = "";
            }
        } else {
            textoNomeArquivo.textContent = "Nenhum arquivo escolhido";
        }
    });

    formCadastro.addEventListener("submit", (e) => {
        e.preventDefault();

        let valido = true;

        erroTitulo.textContent = "";
        erroOrigem.textContent = "";
        erroImagem.textContent = "";

        if (!inputTitulo.value.trim()) {
            erroTitulo.textContent = "O título da receita é obrigatório.";
            valido = false;
        }

        if (!inputOrigem.value.trim()) {
            erroOrigem.textContent = "A origem da receita é obrigatória.";
            valido = false;
        }
        if (!inputImagem.files || inputImagem.files.length === 0) {
            erroImagem.textContent = "A imagem da receita é obrigatória.";
            valido = false;
        }

        if (valido) {
            const ficheiro = inputImagem.files[0];
            const urlImagemTemp = URL.createObjectURL(ficheiro);

            const novaReceita = {
                id: Date.now(),
                titulo: inputTitulo.value.trim(),
                imagem: urlImagemTemp,
                favoritos: 0
            };

            listaReceitas.unshift(novaReceita); 
            renderizarReceitas();

            formCadastro.reset();
            textoNomeArquivo.textContent = "Nenhum arquivo escolhido";
            alert("Receita cadastrada com sucesso!");
        }
    });

    function abrirModalLogin() { modalLogin.classList.add("ativo"); }
    function fecharModalLogin() { modalLogin.classList.remove("ativo"); }

    if (fecharModal) fecharModal.addEventListener("click", fecharModalLogin);
    window.addEventListener("click", (e) => { if (e.target === modalLogin) fecharModalLogin(); });

    if (usuarioLogado.autenticado) {
        document.querySelector(".secao_usuario h5").textContent = usuarioLogado.nome;
        document.querySelector(".img_login").src = usuarioLogado.foto;

        if (btnLoginHeader) {
            btnLoginHeader.textContent = "Logout";
            btnLoginHeader.addEventListener("click", () => window.location.reload());
        }

        if (usuarioLogado.tipo === "comum") {
            btnVerPerfil.disabled = true;
        } else if (usuarioLogado.tipo === "chef") {
            btnVerPerfil.disabled = false;
            btnVerPerfil.addEventListener("click", () => {
                infoFavoritos.textContent = `${usuarioLogado.totalFavoritos} Favoritos`;
                infoReceitas.textContent = `${usuarioLogado.totalReceitas} Receitas`;
                menuLateral.classList.add("aberto");
                overlayMenu.classList.add("ativo");
            });
        }
    } else {
        if (btnLoginHeader) btnLoginHeader.addEventListener("click", abrirModalLogin);
        if (btnVerPerfil) {
            btnVerPerfil.addEventListener("click", (e) => {
                e.preventDefault();
                abrirModalLogin();
            });
        }
    }

    function fecharSidebar() {
        menuLateral.classList.remove("aberto");
        overlayMenu.classList.remove("ativo");
    }

    if (fecharMenu) fecharMenu.addEventListener("click", fecharSidebar);
    if (overlayMenu) overlayMenu.addEventListener("click", fecharSidebar);

 
    renderizarReceitas();
});