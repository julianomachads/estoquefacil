const $ = (id) => document.getElementById(id);

function lerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}
function salvarUsuarios(lista) {
  localStorage.setItem("usuarios", JSON.stringify(lista));
}
function lerProdutos() {
  return JSON.parse(localStorage.getItem("produtos")) || [];
}
function salvarProdutos(lista) {
  localStorage.setItem("produtos", JSON.stringify(lista));
}
function getUsuarioLogado() {
  const email = localStorage.getItem("usuarioLogado");
  if (!email) return null;
  return lerUsuarios().find((u) => u.email === email) || null;
}

function mostrarApp() {
  $("telaAuth").classList.add("oculto");
  $("navbar").classList.remove("oculto");
  $("telaProdutos").classList.remove("oculto");
  renderizarProdutos();
}

function mostrarLogin() {
  $("navbar").classList.add("oculto");
  $("telaProdutos").classList.add("oculto");
  $("telaAuth").classList.remove("oculto");
  $("formLogin").classList.remove("oculto");
  $("formCadastro").classList.add("oculto");
}

$("linkIrCadastro").addEventListener("click", (e) => {
  e.preventDefault();
  $("formLogin").classList.add("oculto");
  $("formCadastro").classList.remove("oculto");
  limparErros();
});

$("linkIrLogin").addEventListener("click", (e) => {
  e.preventDefault();
  $("formCadastro").classList.add("oculto");
  $("formLogin").classList.remove("oculto");
  limparErros();
});

function limparErros() {
  $("erroLogin").textContent = "";
  $("erroCadastro").textContent = "";
}

$("formCadastro").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = $("cadNome").value.trim();
  const email = $("cadEmail").value.trim().toLowerCase();
  const senha = $("cadSenha").value;

  const usuarios = lerUsuarios();

  if (usuarios.some((u) => u.email === email)) {
    $("erroCadastro").textContent = "Este e-mail já está cadastrado.";
    return;
  }

  usuarios.push({ nome, email, senha });
  salvarUsuarios(usuarios);

  $("formCadastro").reset();
  $("erroCadastro").textContent = "";
  $("formCadastro").classList.add("oculto");
  $("formLogin").classList.remove("oculto");
  $("erroLogin").textContent = "Conta criada! Faça login para continuar.";
  $("erroLogin").style.color = "#16a34a";
});

$("formLogin").addEventListener("submit", (e) => {
  e.preventDefault();
  $("erroLogin").style.color = "";

  const email = $("loginEmail").value.trim().toLowerCase();
  const senha = $("loginSenha").value;

  const usuario = lerUsuarios().find((u) => u.email === email);

  if (!usuario || usuario.senha !== senha) {
    $("erroLogin").textContent = "E-mail ou senha inválidos.";
    return;
  }

  localStorage.setItem("usuarioLogado", usuario.email);
  $("formLogin").reset();
  $("erroLogin").textContent = "";
  mostrarApp();
});

$("btnSair").addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  mostrarLogin();
});

function renderizarProdutos() {
  const produtos = lerProdutos();
  const corpo = $("corpoTabela");

  if (produtos.length === 0) {
    $("estadoVazio").classList.remove("oculto");
    $("estadoLista").classList.add("oculto");
    return;
  }

  $("estadoVazio").classList.add("oculto");
  $("estadoLista").classList.remove("oculto");

  corpo.innerHTML = "";

  produtos.forEach((p) => {
    const tr = document.createElement("tr");

    const preco = Number(p.preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const validade = p.validade
      ? new Date(p.validade + "T00:00:00").toLocaleDateString("pt-BR")
      : "—";

    const promo = p.promocao
      ? '<span class="badge-promo">Sim</span>'
      : "Não";

    tr.innerHTML = `
      <td>${escapar(p.nome)}</td>
      <td>${escapar(p.tipo)}</td>
      <td>${p.quantidade}</td>
      <td>${preco}</td>
      <td>${validade}</td>
      <td>${escapar(p.condicao)}</td>
      <td>${promo}</td>
      <td><span class="etiqueta-cor" style="background:${p.cor}"></span></td>
      <td>${escapar(p.autor)}</td>
      <td>
        <div class="acoes">
          <button class="btn-acao btn-acao--editar" data-id="${p.id}">Editar</button>
          <button class="btn-acao btn-acao--excluir" data-id="${p.id}">Excluir</button>
        </div>
      </td>
    `;
    corpo.appendChild(tr);
  });

  document.querySelectorAll(".btn-acao--editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirPopupProduto(btn.dataset.id));
  });
  document.querySelectorAll(".btn-acao--excluir").forEach((btn) => {
    btn.addEventListener("click", () => abrirPopupExcluir(btn.dataset.id));
  });
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : texto;
  return div.innerHTML;
}

const overlayProduto = $("overlayProduto");

function abrirPopupProduto(id) {
  $("formProduto").reset();
  $("erroProduto").textContent = "";
  $("valorRange").textContent = $("prodEstoqueMin").value;

  if (id) {
    const produto = lerProdutos().find((p) => p.id === id);
    if (!produto) return;

    $("tituloPopupProduto").textContent = "Editar produto";
    $("produtoId").value = produto.id;
    $("prodNome").value = produto.nome;
    $("prodDescricao").value = produto.descricao || "";
    $("prodTipo").value = produto.tipo;
    $("prodQtd").value = produto.quantidade;
    $("prodPreco").value = produto.preco;
    $("prodValidade").value = produto.validade || "";
    $("prodPromocao").checked = !!produto.promocao;
    $("prodEstoqueMin").value = produto.estoqueMin;
    $("valorRange").textContent = produto.estoqueMin;
    $("prodCor").value = produto.cor;
    document.querySelectorAll('input[name="prodCondicao"]').forEach((r) => {
      r.checked = r.value === produto.condicao;
    });
  } else {
    $("tituloPopupProduto").textContent = "Adicionar produto";
    $("produtoId").value = "";
  }

  overlayProduto.classList.remove("oculto");
}

function fecharPopupProduto() {
  overlayProduto.classList.add("oculto");
}

$("btnAddVazio").addEventListener("click", () => abrirPopupProduto());
$("btnAddLista").addEventListener("click", () => abrirPopupProduto());

$("fecharPopupProduto").addEventListener("click", fecharPopupProduto);
$("cancelarProduto").addEventListener("click", fecharPopupProduto);

overlayProduto.addEventListener("click", (e) => {
  if (e.target === overlayProduto) fecharPopupProduto();
});

$("prodEstoqueMin").addEventListener("input", () => {
  $("valorRange").textContent = $("prodEstoqueMin").value;
});

$("formProduto").addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = getUsuarioLogado();
  if (!usuario) {
    mostrarLogin();
    return;
  }

  const condicaoEl = document.querySelector('input[name="prodCondicao"]:checked');

  const dados = {
    nome: $("prodNome").value.trim(),
    descricao: $("prodDescricao").value.trim(),
    tipo: $("prodTipo").value,
    quantidade: Number($("prodQtd").value),
    preco: Number($("prodPreco").value),
    validade: $("prodValidade").value,
    condicao: condicaoEl ? condicaoEl.value : "Novo",
    promocao: $("prodPromocao").checked,
    estoqueMin: Number($("prodEstoqueMin").value),
    cor: $("prodCor").value,
  };

  if (!dados.nome || !dados.tipo) {
    $("erroProduto").textContent = "Preencha os campos obrigatórios (*).";
    return;
  }

  const produtos = lerProdutos();
  const idEdicao = $("produtoId").value;

  if (idEdicao) {
    const indice = produtos.findIndex((p) => p.id === idEdicao);
    if (indice !== -1) {
      produtos[indice] = { ...produtos[indice], ...dados };
    }
  } else {
    dados.id = gerarId();
    dados.autor = usuario.nome;
    produtos.push(dados);
  }

  salvarProdutos(produtos);
  fecharPopupProduto();
  renderizarProdutos();
});

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const overlayExcluir = $("overlayExcluir");
let idParaExcluir = null;

function abrirPopupExcluir(id) {
  const produto = lerProdutos().find((p) => p.id === id);
  if (!produto) return;
  idParaExcluir = id;
  $("textoExcluir").textContent =
    `Tem certeza que deseja excluir "${produto.nome}"?`;
  overlayExcluir.classList.remove("oculto");
}

function fecharPopupExcluir() {
  overlayExcluir.classList.add("oculto");
  idParaExcluir = null;
}

$("cancelarExcluir").addEventListener("click", fecharPopupExcluir);

overlayExcluir.addEventListener("click", (e) => {
  if (e.target === overlayExcluir) fecharPopupExcluir();
});

$("confirmarExcluir").addEventListener("click", () => {
  if (!idParaExcluir) return;
  const produtos = lerProdutos().filter((p) => p.id !== idParaExcluir);
  salvarProdutos(produtos);
  fecharPopupExcluir();
  renderizarProdutos();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!overlayProduto.classList.contains("oculto")) fecharPopupProduto();
    if (!overlayExcluir.classList.contains("oculto")) fecharPopupExcluir();
  }
});

if (getUsuarioLogado()) {
  mostrarApp();
} else {
  mostrarLogin();
}
