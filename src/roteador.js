const express = require('express')
const rotas = express()
const validaSenha = require('./intermediarios')
const {
  listarContas,
  criarConta,
  atualizarUsuario,
  excluirConta,
  depositar,
  sacar,
  transferir,
  exibirSaldo,
  gerarExtrato
} = require('./controladores/controladores')

module.exports = rotas

rotas.get('/contas', validaSenha, listarContas)
rotas.post('/contas', criarConta)
rotas.put('/contas/:numeroConta/usuario', atualizarUsuario)
rotas.delete('/contas/:numeroConta', excluirConta)
rotas.post('/transacoes/depositar', depositar)
rotas.post('/transacoes/sacar', sacar)
rotas.post('/transacoes/transferir', transferir)
rotas.get('/contas/saldo', exibirSaldo)
rotas.get('/contas/extrato', gerarExtrato)
