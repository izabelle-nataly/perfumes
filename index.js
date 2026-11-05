
//npm init -y
//npm install express mysql2
//node criarTabela.js
//http://localhost:3000

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { pool } = require("./db");

const app = express();
const port = 3000;

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura";

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, "public")));

// GET - Listar produtos com Filtros e Paginação
app.get("/produtos", async (req, res) => {
    try {
        const { min, max, marca, busca, pagina = 1, limite = 6 } = req.query;

        let sql = "SELECT * FROM produtos WHERE 1=1";
        let countSql = "SELECT COUNT(*) as total FROM produtos WHERE 1=1";
        let valores = [];
        let countValores = [];

        // Filtro de Preço Mínimo
        if (min !== undefined && min !== "") {
            sql += " AND preco >= ?";
            countSql += " AND preco >= ?";
            valores.push(Number(min));
            countValores.push(Number(min));
        }

        // Filtro de Preço Máximo
        if (max !== undefined && max !== "") {
            sql += " AND preco <= ?";
            countSql += " AND preco <= ?";
            valores.push(Number(max));
            countValores.push(Number(max));
        }

        // Filtro por Marca/Categoria
        if (marca && marca !== "") {
            sql += " AND marca = ?";
            countSql += " AND marca = ?";
            valores.push(marca);
            countValores.push(marca);
        }

        // Filtro por Busca (Nome ou Aroma)
        if (busca && busca !== "") {
            sql += " AND (nome LIKE ? OR aroma LIKE ?)";
            countSql += " AND (nome LIKE ? OR aroma LIKE ?)";
            const termoBusca = `%${busca}%`;
            valores.push(termoBusca, termoBusca);
            countValores.push(termoBusca, termoBusca);
        }

        // Paginação
        const pageNum = Math.max(1, parseInt(pagina));
        const limitNum = Math.max(1, parseInt(limite));
        const offset = (pageNum - 1) * limitNum;

        sql += " LIMIT ? OFFSET ?";
        valores.push(limitNum, offset);

        // Executar consultas
        const [resultado] = await pool.query(sql, valores);
        const [totalResultado] = await pool.query(countSql, countValores);

        const totalItens = totalResultado[0].total;
        const totalPaginas = Math.ceil(totalItens / limitNum);

        res.status(200).json({
            produtos: resultado,
            paginacao: {
                totalItens,
                totalPaginas,
                paginaAtual: pageNum,
                limite: limitNum
            }
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// GET - Buscar produto por ID
app.get("/produtos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await pool.query("SELECT * FROM produtos WHERE id = ?", [id]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: "Produto não encontrado" });
        }

        res.status(200).json(resultado[0]);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// POST - Cadastrar usuário
app.post("/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
        }

        const [existente] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (existente.length > 0) {
            return res.status(400).json({ mensagem: "E-mail já cadastrado." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        await pool.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [
            nome,
            email,
            senhaHash
        ]);

        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// POST - Login do usuário
app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (usuarios.length === 0) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }

        const usuario = usuarios[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            nome: usuario.nome
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
