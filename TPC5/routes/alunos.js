var express = require('express');
var router = express.Router();
const axios = require('axios');
const apiURL = 'http://localhost:3001/api/alunos';

router.get('/', function(req, res, next) {
  axios.get(apiURL)
    .then(resp => res.status(200).render("alunos", { alunos: resp.data, title: "Gestão de Alunos" }))
    .catch(erro => res.status(500).render("error", erro))
});

router.get('/editar/:id', function(req, res, next) {
  axios.get(apiURL + '/' + req.params.id)
    .then(resp => res.status(200).render("aluno", { aluno: resp.data, title: "Gestão de Alunos" }))
    .catch(erro => res.status(500).render("error", erro))
});

router.post('/editar/:id', function(req, res, next) {
  axios.put(apiURL + '/' + req.params.id, req.body)
    .then(resp => res.redirect('/alunos'))
    .catch(erro => res.status(500).render("error", erro))
});

router.get('/apagar/:id', function(req, res, next) {
    axios.delete(apiURL + '/' + req.params.id)
      .then(resp => res.status(201).redirect('/alunos'))
      .catch(erro => res.status(500).render("error", erro))
});

router.get('/adicionar', function(req, res, next) {
  res.status(200).render("alunoAdicionar", { aluno: {}, title: "Gestão de Alunos" })
});

router.post('/adicionar', function(req, res, next) {
  axios.post(apiURL + '/adicionar', req.body)
    .then(resp => res.redirect('/alunos'))
    .catch(erro => res.status(500).render("error", erro))
});

module.exports = router;