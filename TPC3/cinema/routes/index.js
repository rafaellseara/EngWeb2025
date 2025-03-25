var express = require('express');
var axios = require('axios');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'EngWeb 2025 - TPC3',
    docente: 'José Carlos Ramalho',
    instituição: 'UMinho'
  });
});

router.get('/filmes', function(req, res, next) {
  axios.get('http://localhost:3000/filmes?_sort=titulo')
    .then(resp => {
      var filmes = resp.data
      res.render('filmes', { filmes: filmes, title: 'Lista de Filmes' })
    })
    .catch(err => {
      console.log(err)
      res.render('error', { error: err })
    })
});

router.get('/filmes/adicionar', (req, res) => {
  res.render('adicionar');
});

router.post('/filmes/adicionar', (req, res) => {
  const newfilme = {
    title: req.body.title,
    year: parseInt(req.body.year, 10),
    cast: req.body.cast ? req.body.cast.split(',').map(actor => actor.trim()) : [],
    genres: req.body.genres ? req.body.genres.split(',').map(genre => genre.trim()) : []
  };

  axios.post('http://localhost:3000/filmes', newfilme)
    .then(() => res.redirect('/filmes'))
    .catch(err => {
      console.error('Erro ao adicionar o filme:', err);
      res.status(500).send('Erro ao adicionar o filme.');
    });
});

router.get('/filmes/editar/:id', (req, res) => {
  const filmeId = req.params.id;

  axios.get(`http://localhost:3000/filmes/${filmeId}`)
    .then(response => {
      res.render('editFilme', { filme: response.data });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Erro ao carregar o filme.");
    });
});

router.post('/filmes/editar/:id', (req, res) => {
  const filmeId = req.params.id;

  const newfilme = {
    title: req.body.title,
    year: parseInt(req.body.year, 10),
    cast: req.body.cast ? req.body.cast.split(',').map(actor => actor.trim()) : [],
    genres: req.body.genres ? req.body.genres.split(',').map(genre => genre.trim()) : []
  };

  axios.put(`http://localhost:3000/filmes/${filmeId}`, newfilme)
    .then(() => {
      res.redirect('/filmes');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Erro ao atualizar o filme.");
    });
});

router.post('/filmes/delete/:id', (req, res) => {
  const filmeId = req.params.id;

  axios.delete(`http://localhost:3000/filmes/${filmeId}`)
    .then(() => {
      res.redirect('/filmes');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Erro ao eliminar o filme.");
    });
});

router.get('/filmes/:id', function(req, res, next) {
  axios.get(`http://localhost:3000/filmes/${req.params.id}`)
    .then(resp => {
      var filme = resp.data
      res.render('filme', { filme: filme, title: filme.title })
    })
    .catch(err => {
      console.log(err)
      res.render('error', { error: err })
    })
});

router.delete('/filmes/:id', function(req, res, next) {
  axios.delete(`http://localhost:3000/filmes/${req.params.id}`)
    .then(resp => {
      res.status(204).send()
    })
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
});

router.put('/filmes/:id', function(req, res, next) {
  axios.put(`http://localhost:3000/filmes/${req.params.id}`, req.body)
    .then(resp => {
      res.status(204).send()
    })
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
});


module.exports = router;
