const express = require("express");
const dotenv = require('dotenv');
const path = require("path");
const app = express();

dotenv.config();

const port = process.env.APP_PORT || 3000;

// Conexão com o banco
const { checkConnection } = require("./models/databaseModel");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Retorno quanto ao funcionamento da conexão com o banco
(async () => {
    const isDbConnected = await checkConnection();
    if (isDbConnected) {
        console.log("Servidor Banco de Dados - OK ...");
    } else {
        console.error("Falha na conexão com o banco de dados!");
    }
})();


app.get("/", (request, response) => {
    response.send({ "message": "Servidor rodando!" });
});

app.listen(port, () => {
    console.log(`servidor rodando na porta: ${port}`)
});
