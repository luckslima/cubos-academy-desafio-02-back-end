const { format } = require('date-fns')
let {
  banco,
  contas,
  saques,
  depositos,
  transferencias,
  indice
} = require('../dados/bancodedados')

const gerarData = () => {
  const data = new Date()

  const string = format(data, 'yyyy-MM-dd HH:mm:ss')

  return string
}

const listarContas = (req, res) => {
  return res.status(200).json(contas)
}

const criarConta = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

  const cpfExistente = contas.find(contas => {
    return contas.usuario.cpf === cpf
  })

  const emailExistente = contas.find(contas => {
    return contas.usuario.email === email
  })

  if (cpfExistente || emailExistente) {
    return res.status(403).json({
      mensagem: 'Já existe uma conta com o cpf ou e-mail informado!'
    })
  }

  if (nome && cpf && data_nascimento && telefone && email && senha) {
    const novaConta = {
      numero: indice++,
      saldo: 0,
      usuario: {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
      }
    }

    contas.push(novaConta)

    return res.status(200).json()
  }

  return res.status(400).json({
    mensagem: 'Preencha todos os dados!'
  })
}

const atualizarUsuario = (req, res) => {
  const { numeroConta } = req.params
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

  if (Number(numeroConta) % Number(numeroConta) === 0) {
    const contaEncontrada = contas.find(contas => {
      return contas.numero === Number(numeroConta)
    })

    if (contaEncontrada) {
      if (nome && cpf && data_nascimento && telefone && email && senha) {
        const cpfExistente = contas.find(contas => {
          return contas.usuario.cpf === cpf
        })

        const emailExistente = contas.find(contas => {
          return contas.usuario.email === email
        })

        if (cpfExistente) {
          if (cpfExistente.numero !== contaEncontrada.numero) {
            return res.status(403).json({
              mensagem: 'Já existe uma conta com o cpf informado!'
            })
          }
        }

        if (emailExistente) {
          if (emailExistente.numero !== contaEncontrada.numero) {
            return res.status(403).json({
              mensagem: 'Já existe uma conta com o e-mail informado!'
            })
          }
        }

        const novoUsuario = {
          nome,
          cpf,
          data_nascimento,
          telefone,
          email,
          senha
        }

        contaEncontrada.usuario = novoUsuario

        return res.status(200).json()
      }

      return res.status(400).json({
        mensagem: 'Preencha todos os dados!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta não encontrada!'
    })
  }

  return res.status(400).json({
    mensagem: 'Insira um numero de conta válido!'
  })
}

const excluirConta = (req, res) => {
  const { numeroConta } = req.params
  const contaEncontrada = contas.find(contas => {
    return contas.numero === Number(numeroConta)
  })

  if (Number(numeroConta) % Number(numeroConta) === 0) {
    if (contaEncontrada) {
      if (contaEncontrada.saldo === 0) {
        contas = contas.filter(contas => {
          return contas.numero !== Number(numeroConta)
        })
        return res.status(200).json()
      }

      return res.status(403).json({
        mensagem: 'A conta só pode ser removida se o saldo for zero!'
      })
    }

    return res.status(404).json({
      mensagem: 'Não existe conta a ser excluída para o número informado.'
    })
  }

  return res.status(400).json({
    mensagem: 'Insira um número de conta válido!'
  })
}

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body

  const contaEncontrada = contas.find(contas => {
    return contas.numero === Number(numero_conta)
  })

  if (numero_conta && valor) {
    if (contaEncontrada) {
      if (valor >= 0) {
        contaEncontrada.saldo = contaEncontrada.saldo + valor
        const data = gerarData()
        const registroDeposito = {
          data,
          numero_conta,
          valor
        }
        depositos.push(registroDeposito)
        return res.status(204).json()
      }

      return res.status(400).json({
        mensagem: 'Insira um valor válido!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!'
    })
  }

  return res.status(400).json({
    mensagem: 'O número da conta e o valor são obrigatórios!'
  })
}

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body

  const contaEncontrada = contas.find(contas => {
    return contas.numero === Number(numero_conta)
  })

  if (numero_conta && valor && senha) {
    if (contaEncontrada) {
      if (senha === contaEncontrada.usuario.senha) {
        if (contaEncontrada.saldo >= valor) {
          contaEncontrada.saldo = contaEncontrada.saldo - valor
          const data = gerarData()
          const registroSaque = {
            data,
            numero_conta,
            valor
          }
          saques.push(registroSaque)
          return res.status(204).json()
        }

        return res.status(400).json({
          mensagem: 'Saldo insuficiente!'
        })
      }

      return res.status(403).json({
        mensagem: 'Senha inválida!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!'
    })
  }

  return res.status(400).json({
    mensagem: 'O número da conta, o valor e a senha são obrigatórios!'
  })
}

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

  if (numero_conta_origem && numero_conta_destino && valor && senha) {
    const contaOrigemEncontrada = contas.find(contas => {
      return contas.numero === Number(numero_conta_origem)
    })

    const contaDestinoEncontrada = contas.find(contas => {
      return contas.numero === Number(numero_conta_destino)
    })

    if (contaOrigemEncontrada && contaDestinoEncontrada) {
      if (contaOrigemEncontrada.usuario.senha === senha) {
        if (contaOrigemEncontrada.saldo >= valor) {
          contaOrigemEncontrada.saldo = contaOrigemEncontrada.saldo - valor
          contaDestinoEncontrada.saldo = contaDestinoEncontrada.saldo + valor

          const data = gerarData()

          const registroTransferencia = {
            data,
            numero_conta_origem,
            numero_conta_destino,
            valor
          }

          transferencias.push(registroTransferencia)

          return res.status(204).json()
        }

        return res.status(400).json({
          mensagem: 'Saldo insuficiente!'
        })
      }

      return res.status(403).json({
        mensagem: 'Senha inválida!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!'
    })
  }

  return res.status(400).json({
    mensagem:
      'Os números das contas de origem e de destino, o valor e a senha são obrigatórios!'
  })
}

const exibirSaldo = (req, res) => {
  const { numero_conta, senha } = req.query

  if ((numero_conta, senha)) {
    const contaEncontrada = contas.find(contas => {
      return contas.numero === Number(numero_conta)
    })

    if (contaEncontrada) {
      if (contaEncontrada.usuario.senha === senha) {
        const saldoConta = contaEncontrada.saldo
        return res.status(200).json({ saldo: saldoConta })
      }

      return res.status(403).json({
        mensagem: 'Senha inválida!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!'
    })
  }

  return res.status(400).json({
    mensagem: 'O número da conta e senha são obrigatórios!'
  })
}

const gerarExtrato = (req, res) => {
  const { numero_conta, senha } = req.query

  if (numero_conta && senha) {
    const contaEncontrada = contas.find(contas => {
      return contas.numero === Number(numero_conta)
    })

    if (contaEncontrada) {
      if (contaEncontrada.usuario.senha === senha) {
        const depositosConta = depositos.find(depositos => {
          return depositos.numero_conta === numero_conta
        })
        const saquesConta = saques.find(saques => {
          return saques.numero_conta === numero_conta
        })
        const transferenciasEnviadas = transferencias.find(transferencias => {
          return transferencias.numero_conta_origem === numero_conta
        })
        const transferenciasRecebidas = transferencias.find(transferencias => {
          return transferencias.numero_conta_destino === numero_conta
        })

        const extrato = {
          depositos: depositosConta,
          saques: saquesConta,
          transferenciasEnviadas,
          transferenciasRecebidas
        }

        return res.status(200).json(extrato)
      }

      return res.status(403).json({
        mensagem: 'Senha inválida!'
      })
    }

    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!'
    })
  }

  return res.status(400).json({
    mensagem: 'O número da conta e senha são obrigatórios!'
  })
}

module.exports = {
  listarContas,
  criarConta,
  atualizarUsuario,
  excluirConta,
  depositar,
  sacar,
  transferir,
  exibirSaldo,
  gerarExtrato
}
