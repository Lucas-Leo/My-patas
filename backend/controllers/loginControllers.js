const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { LoginUnificado } = require("../models/loginServices");

dotenv.config();

const loginController = {
  Login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Validação dos campos obrigatórios
      if (!email || !senha) {
        return res.status(400).json({
          erro: "E-mail e senha são obrigatórios.",
        });
      }

      // Busca o usuário pelo e-mail
      const { usuario } = await LoginUnificado(email);

      // Usuário não encontrado
      if (!usuario) {
        return res.status(401).json({
          erro: "Usuário não encontrado.",
        });
      }

      // Verifica a senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      // Senha incorreta
      if (!senhaValida) {
        return res.status(401).json({
          erro: "Senha incorreta.",
        });
      }

      // Geração do token JWT
      const token = jwt.sign(
        {
          id: usuario.idusuario,
          email: usuario.email,
          tipo: usuario.fk_idtipo,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
      );

      // Retorna apenas os dados existentes na tabela usuarios
      const usuarioFormatado = {
        id: usuario.idusuario,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        data_nasc: usuario.data_nasc,
        cpf: usuario.cpf,
        foto: usuario.foto,
        fk_idsexo: usuario.fk_idsexo,
        fk_idendereco: usuario.fk_idendereco,
        fk_idtipo: usuario.fk_idtipo,
        data_criacao: usuario.data_criacao,
        data_att: usuario.data_att,
      };

      // Resposta de sucesso
      return res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        token,
        usuario: usuarioFormatado,
      });
    } catch (error) {
      console.error("Erro no login:", error);

      return res.status(500).json({
        erro: error.message || "Erro interno no servidor.",
      });
    }
  },
};

module.exports = loginController;
