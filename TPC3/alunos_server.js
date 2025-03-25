// alunos_server.js
// EW2024 : 04/03/2024
// by jcr

var http = require('http')
var axios = require('axios')
const { parse } = require('querystring');

var templates = require('./templates')
var static = require('./static.js')

// Aux functions
function collectRequestBodyData(request, callback) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

var alunosServer = http.createServer((req, res) => {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    if(static.staticResource(req)){
        static.serveStaticResource(req, res)
    } else {
        switch(req.method){
            case "GET": 
                if(req.url === '/' || req.url === '/alunos'){
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    axios.get('http://localhost:3000/alunos')
                        .then(resp => {
                            alunos = resp.data
                            res.write(templates.studentsListPage(alunos,d))
                            res.end()
                        })
                        .catch(erro => {
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.errorPage(erro,d))
                            res.end()
                        })
                }
                else if(req.url.match(/\alunos\/[A|PG]\d+$/)){
                    id = req.url.split('/')[2]
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    axios.get('http://localhost:3000/alunos/' + id)
                        .then(resp => {
                            aluno = resp.data
                            res.write(templates.studentPage(aluno,d))
                            res.end()
                        })
                        .catch(erro => {
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.errorPage(erro,d))
                            res.end()
                        })
                }
                else if(req.url == '/alunos/registo'){
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(templates.studentFormPage(d))
                    res.end()
                }
                else if(req.url.match(/\alunos\/edit\/[A|PG]\d+$/)){
                    id = req.url.split("/")[3]
                    axios.get('http://localhost:3000/alunos/' + id)
                        .then(resp => {
                            aluno = resp.data
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.studentFormEditPage(aluno,d))
                            res.end()
                        })
                        .catch(erro => {
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.errorPage(erro,d))
                            res.end()
                        })
                }
                else if(req.url.match(/\alunos\/delete\/[A|PG]\d+$/)){
                    id = req.url.split("/")[3]
                    axios.get('http://localhost:3000/alunos/' + id)
                        .then(resp => {
                            aluno = resp.data
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.confirmDeletePage(aluno, d))
                            res.end()
                        })
                        .catch(erro => {
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.errorPage(erro, d))
                            res.end()
                        })
                }
                else{
                    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>GET falhou</p>`)
                    res.end()
                }
                break
            case "POST":
                if(req.url === '/alunos/registo'){
                    collectRequestBodyData(req, result => {
                       if(result){
                            axios.post('http://localhost:3000/alunos', result)
                                .then(resp => {
                                    res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(`<p>Registo Inserido: ${JSON.stringify(resp.data)}</p>`)
                                    res.write(`<a href="/alunos">Voltar</a>`)
                                    res.end()
                                })
                                .catch(erro => {
                                    console.log(erro)
                                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(templates.errorPage(erro,d))
                                    res.end()
                                })
                       }
                       else{ 
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(`RequestBodyData não apresentou resultado`)
                            res.end()
                       }
                    })
                } 
                else if(req.url.match(/\alunos\/edit\/[A|PG]\d+$/)){
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.put('http://localhost:3000/alunos/' + result.id, result)
                                .then(resp => {
                                    res.writeHead(201, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(`<p>Registo Atualizado: ${JSON.stringify(resp.data)}</p>`)
                                    res.write(`<a href="/alunos">Voltar</a>`)
                                    res.end()
                                })
                                .catch(erro => {
                                    console.log(erro)
                                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(templates.errorPage(erro,d))
                                    res.end()
                                })
                        }else{ 
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(`RequestBodyData não apresentou resultado`)
                            res.end()
                        }
                    })
                } 
                else if(req.url.match(/\alunos\/delete\/[A|PG]\d+$/)){
                    id = req.url.split("/")[3]
                    axios.delete('http://localhost:3000/alunos/' + id)
                                .then(resp => {
                                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(`<p>Registo Eliminado</p>`)
                                    res.write(`<a href="/alunos">Voltar</a>`)
                                    res.end()
                                })
                                .catch(erro => {
                                    console.log(erro)
                                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(templates.errorPage(erro,d))
                                    res.end()
                                })
                }
                else{
                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>POST falhou</p>`)
                    res.end()
                }
                break
            case "PUT":
                if(req.url.match(/\alunos\/edit\/[A|PG]\d+$/)){
                    collectRequestBodyData(req, result => {
                        if(result){
                            axios.put('http://localhost:3000/alunos/' + result.id, result)
                                .then(resp => {
                                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(`<p>Registo Atualizado: ${JSON.stringify(resp.data)}</p>`)
                                    res.write(`<a href="/alunos">Voltar</a>`)
                                    res.end()
                                })
                                .catch(erro => {
                                    console.log(erro)
                                    res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                                    res.write(templates.errorPage(erro,d))
                                    res.end()
                                })
                        }else{ 
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(`RequestBodyData não apresentou resultado`)
                            res.end()
                        }
                    })
                }
                else{
                    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>PUT falhou</p>`)
                    res.end()
                }
                break
            case "DELETE":
                if(req.url.match(/\/alunos\/[A|PG]\d+$/)){
                    id = req.url.split("/")[2]
                    axios.delete('http://localhost:3000/alunos/' + id)
                        .then(resp => {
                            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(`<p>Registo Eliminado</p>`)
                            res.write(`<a href="/alunos">Voltar</a>`)
                            res.end()
                        })
                        .catch(erro => {
                            console.log(erro)
                            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                            res.write(templates.errorPage(erro,d))
                            res.end()
                        })
                }
                else{
                    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(`<p>DELETE falhou</p>`)
                    res.end()
                }
                break
            default: 
                res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(`<p>Método nao suportado</p>`)
                res.end()
        }
    }
})

alunosServer.listen(7777, ()=>{
    console.log("Servidor à escuta na porta 7777...")
})