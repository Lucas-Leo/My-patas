// Este arquivo implementa o login, retornando apenas os dados da tabela de usuários.

const { banco } = require("./databaseModel"); // Chamando o banco

// Busca um usuário pelo e-mail
const Login = async (email) => {
  const query = `
    SELECT
      u.idusuario,
      u.nome,
      u.email,
      u.telefone,
      u.fk_idsexo,
      u.data_nasc,
      u.cpf,
      u.senha,
      u.foto,
      u.fk_idendereco,
      u.fk_idtipo,
      u.data_criacao,
      u.data_att
    FROM usuarios u
    WHERE u.email = ?
  `;

  const [rows] = await banco.query(query, [email]);
  return rows;
};

// Versão simplificada do login unificado.
// Mantém o mesmo nome para evitar alterações no controller.
const LoginUnificado = async (email) => {
  const usuarioRows = await Login(email);

  return {
    usuario: usuarioRows.length > 0 ? usuarioRows[0] : null,
  };
};

module.exports = {
  Login,
  LoginUnificado,
};