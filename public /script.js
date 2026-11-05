let paginaAtual = 1;
const limite = 6;

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();

    document.getElementById("formFiltros").addEventListener("submit", (e) => {
        e.preventDefault();
        paginaAtual = 1;
        carregarProdutos();
    });

    document.getElementById("btnLimpar").addEventListener("click", () => {
        document.getElementById("formFiltros").reset();
        paginaAtual = 1;
        carregarProdutos();
    });
});

async function carregarProdutos() {
    const min = document.getElementById("min").value;
    const max = document.getElementById("max").value;
    const marca = document.getElementById("marca").value;
    const busca = document.getElementById("busca").value;

    const params = new URLSearchParams({
        pagina: paginaAtual,
        limite: limite
    });

    if (min) params.append("min", min);
    if (max) params.append("max", max);
    if (marca) params.append("marca", marca);
    if (busca) params.append("busca", busca);

    try {
        const resposta = await fetch(`/produtos?${params.toString()}`);
        const dados = await resposta.json();

        renderizarProdutos(dados.produtos);
        renderizarPaginacao(dados.paginacao);
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        document.getElementById("gridProdutos").innerHTML = "<p>Erro ao carregar produtos.</p>";
    }
}

function renderizarProdutos(produtos) {
    const grid = document.getElementById("gridProdutos");
    grid.innerHTML = "";

    if (!produtos || produtos.length === 0) {
        grid.innerHTML = "<p>Nenhum produto encontrado com os filtros selecionados.</p>";
        return;
    }

    produtos.forEach((produto) => {
        const card = document.createElement("div");
        card.className = "card-produto";

        const precoFormatado = Number(produto.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        card.innerHTML = `
            <div>
                <h3>${produto.nome}</h3>
                <div class="marca">${produto.marca}</div>
                <p class="descricao">${produto.descricao || ""}</p>
                <p class="aroma"><strong>Aroma:</strong> ${produto.aroma || "Não informado"}</p>
            </div>
            <div class="preco">${precoFormatado}</div>
        `;

        grid.appendChild(card);
    });
}

function renderizarPaginacao(paginacao) {
    const divPaginacao = document.getElementById("paginacao");
    divPaginacao.innerHTML = "";

    const { totalPaginas, paginaAtual: atual } = paginacao;

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === atual) btn.classList.add("ativo");

        btn.addEventListener("click", () => {
            paginaAtual = i;
            carregarProdutos();
        });

        divPaginacao.appendChild(btn);
    }
}
