
//npm init -y
//npm install express mysql2

const express = require("express")
const app = express()
const port = 3000

app.use(express.json())

const db = require("./db")

// GET - listar todos os produtos
app.get("/produtos", async (req, res) => {
    try {
        const [resultado] = await db.pool.query(
            "SELECT * FROM produtos"
        )

        res.status(200).json(resultado)

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// GET - buscar produto pelo ID
app.get("/produtos/:id", async (req, res) => {
    try {
        const id = req.params.id

        const [resultado] = await db.pool.query(
            "SELECT * FROM produtos WHERE id = ?",
            [id]
        )

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            })
        }

        res.status(200).json(resultado[0])

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// Iniciar a API
app.listen(port, () => {
    console.log("API de perfumes rodando na porta " + port)
})


 // GET - listar e filtrar produtos por preço
 app.get("/produtos", async (req, res) => {
    try {
        const min = req.query.min
        const max = req.query.max

        let sql = "SELECT * FROM produtos"
        let valores = []

        if (min !== undefined && max !== undefined) {
            sql += " WHERE preco >= ? AND preco <= ?"
            valores = [min, max]
        }

        const [resultado] = await db.pool.query(sql, valores)

        res.status(200).json(resultado)

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

