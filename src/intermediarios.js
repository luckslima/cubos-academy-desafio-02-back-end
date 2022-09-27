let { banco } = require('./dados/bancodedados')

const validaSenha = (req, res, next) => {
  const { senha_banco } = req.query

  if (senha_banco) {
    if (senha_banco !== banco.senha) {
      return res.status(401).json({
        mensagem: 'A senha do banco informada é inválida!'
      })
    }

    return next()
  }

  return res.status(400).json({
    mensagem: 'A senha do banco informada é inválida!'
  })
}

module.exports = validaSenha
