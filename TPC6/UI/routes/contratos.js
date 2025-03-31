var express = require('express');
var router = express.Router();
const axios = require('axios');


router.get('/', function(req, res, next) {
  axios.get('http://localhost:16000/contratos').then(resp => {
    res.status(200).render('contratos', {
    docente: "José Ramalho",
    instituição: "Universidade do Minho",
    contratos: resp.data
  })}).catch(erro => res.status(500).render("error", erro));
});

router.get('/entidades/:entidade', async function(req, res, next) {
  try {
    const contratosResp = await axios.get(`http://localhost:16000/contratos?entidade=${req.params.entidade}`);
    const contratos = contratosResp.data;
    const entidadeNIPC = contratos[0].NIPC_entidade_comunicante;
    
    if (contratos.length === 0) {
      return res.status(404).render("error", { error: "Entidade não encontrada ou sem contratos." });
    }

    const entidadeNome = contratos[0].entidade_comunicante;
    const totalValor = contratos.reduce((sum, contrato) => sum + contrato.precoContratual, 0);

    res.status(200).render("entidade", { 
      entidade: { nipc: entidadeNIPC, nome: entidadeNome }, 
      contratos, 
      totalValor 
    });

  } catch (erro) {
    res.status(500).render("error", { error: erro });
  }
});

router.get('/:id', function(req, res, next) {
  axios.get('http://localhost:16000/contratos/' + req.params.id)
    .then(resp => res.status(200).render("contrato", { contrato: resp.data }))
    .catch(erro => res.status(500).render("error", erro))
});



module.exports = router;
