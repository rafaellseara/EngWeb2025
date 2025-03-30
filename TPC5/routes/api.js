var express = require('express');
var router = express.Router();
var Aluno = require('../controllers/alunos');

router.get('/alunos', (req, res) => {
  Aluno.list()
    .then(data => res.json(data)) 
    .catch(erro => res.status(500).jsonp(erro));
});

router.post('/alunos/adicionar', (req, res) => {
    Aluno.insert(req.body)
      .then(data => res.status(201).json(data))
      .catch(erro => res.status(500).jsonp(erro));
});

router.put('/alunos/:id', (req, res) => {
    Aluno.update(req.params.id, req.body)
      .then(data => res.json(data))
      .catch(erro => res.status(500).jsonp(erro));
});

router.get('/alunos/:id', (req, res) => {
    Aluno.findById(req.params.id)
      .then(data => { res.json(data.toJSON())})
      .catch(erro => res.status(500).jsonp(erro));
});

router.delete('/alunos/:id', (req, res) => {
    Aluno.delete(req.params.id)
      .then(() => res.status(204).end())
      .catch(erro => res.status(500).jsonp(erro));
});

module.exports = router;