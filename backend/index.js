const express = require("express");
const dotenv = require('dotenv');
const path = require("path");
const app = express();
const cors = require('cors');


dotenv.config();

const port = process.env.APP_PORT || 3000;

// Conexão com o banco
const { checkConnection } = require("./models/databaseModel");

// Pegando os dados para as rotas das API's das tabelas
const rotasSexo = require("./core/sexoRouters");
const rotasEstados = require("./core/estadosRouters");
const rotasCidades = require("./core/cidadesRouters");
const rotasBairros = require("./core/bairrosRouters");
const rotasRuas = require("./core/ruasRouters");
const rotasEnderecos = require("./core/enderecosRouters");
const rotasTiposUsuario = require("./core/tipos_usuarioRouters");
const rotasUsuarios = require("./core/usuariosRouters");

app.use(cors());
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

// Usando as rotas puxadas anteriormente
app.use("/sexos", rotasSexo);
app.use("/estados", rotasEstados);
app.use("/cidades", rotasCidades);
app.use("/bairros", rotasBairros);
app.use("/ruas", rotasRuas);
app.use("/enderecos", rotasEnderecos);
app.use("/tiposusuario", rotasTiposUsuario);
app.use("/usuarios", rotasUsuarios);

app.listen(port, () => {
    console.log(`servidor rodando na porta: ${port}`)
});
