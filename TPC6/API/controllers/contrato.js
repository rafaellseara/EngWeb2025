var Contrato = require('../models/contrato')

module.exports.getAllContracts = () => {
    return Contrato
        .find()
        .exec()
}

module.exports.getContractById = id => {
    return Contrato
        .findById(id)
        .exec()
}

module.exports.getAllContractsFilterByEntidade = entidade => {
    return Contrato
        .find({entidade_comunicante: entidade})
        .exec()
}

module.exports.getAllContractsFilterByTipo = tipo => {
    return Contrato
        .find({tipoprocedimento: tipo})
        .exec()
}

module.exports.getAllContractsFilterByEntidadeAndTipo = (entidade,tipo) => {
    return Contrato
        .find({
            entidade_comunicante: entidade,
            tipoprocedimento: tipo
        })
        .exec()
}

module.exports.getEntidades = () => {
    return Contrato
    .distinct("entidade_comunicante")
    .sort({entidade_comunicante: 1})
    .exec()
}

module.exports.getTipos = () => {
    return Contrato
        .distinct("tipoprocedimento")
        .sort({tipoprocedimento : 1})
        .exec()
}

module.exports.insert = contrato => {
    var novoContrato = new Contrato(contrato)
    return novoContrato.save()
}

module.exports.delete = id => {
    return Contrato
        .findByIdAndDelete(id)
        .exec()
}

module.exports.update = (id, contrato) => {
    return Contrato
        .findByIdAndUpdate(id, contrato, { new: true })
        .exec()
}