
CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    preco DECIMAL(10,2) NOT NULL,
    aroma VARCHAR(200)
);
