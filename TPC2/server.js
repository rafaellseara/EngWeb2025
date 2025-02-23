const http = require('http');
const axios = require('axios');

const PORT = 4000;
const API_BASE = 'http://localhost:3000';

const fetchData = async (endpoint) => {
    try {
        const { data } = await axios.get(`${API_BASE}/${endpoint}`);
        return data;
    } catch {
        return null;
    }
}

const generateHTML = (title, body) => `
    <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #EDEDE9;
                    color: #444;
                }
                h1 {
                    font-size: 2.5em;
                    text-align: center;
                    color: #D5BDAF;
                    margin-top: 20px;
                    font-weight: bold;
                }
                .container {
                    max-width: 900px;
                    margin: 30px auto;
                    padding: 20px;
                    background-color: white;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
                .section {
                    padding: 15px;
                    border: 1px solid #ddd;
                    margin-bottom: 15px;
                    border-radius: 8px;
                    background-color: #FFFFFF;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .title {
                    font-size: 1.2em;
                    font-weight: 600;
                    color: #D5BDAF;
                    margin-bottom: 10px;
                }
                .content {
                    font-size: 1.1em;
                    line-height: 1.6;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${title}</h1>
                    <div class="content">
                        ${body}
                    </div>
            </div>
        </body>
    </html>
`;

http.createServer(async (req, res) => {
    switch (req.method) {
        case 'GET':
            if (req.url === "/") {
                const alunos = await fetchData('alunos');
                if (!alunos) return res.end(generateHTML('Erro', '<h2>Erro ao carregar alunos</h2>'));
                const cursos = await fetchData('cursos');
                if (!cursos) return res.end(generateHTML('Erro', '<h2>Erro ao carregar cursos</h2>'));
                const instrumentos = await fetchData('instrumentos');
                if (!instrumentos) return res.end(generateHTML('Erro', '<h2>Erro ao carregar instrumentos</h2>'));

                const body = `
                    <div class="section">
                        <h2 class="title">Alunos</h2>
                        <ul>
                            ${alunos.map(a => `<li><a href='alunos/${a.id}'>${a.nome}</a></li>`).join('')}
                        </ul>
                    </div>
                    <div class="section">
                        <h2 class="title">Cursos</h2>
                        <ul>
                            ${cursos.map(c => `<li><a href='cursos/${c.id}'>${c.designacao}</a></li>`).join('')}
                        </ul>
                    </div>
                    <div class="section">
                        <h2 class="title">Instrumentos</h2>
                        <ul>
                            ${instrumentos.map(i => `<li><a href='instrumentos/${i.id}'>${i["#text"]}</a></li>`).join('')}
                        </ul>
                    </div>
                `;

                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                return res.end(generateHTML('Escola de Música', body));
            }

            if (req.url.match(/\/alunos\/.+/)) {
                const id = req.url.split("/")[2];
                const aluno = await fetchData(`alunos/${id}`);
                if (!aluno) return res.end(generateHTML('Erro', '<h2>Erro ao carregar aluno</h2>'));

                const body = `
                    <div class="section">
                        <h2 class="title">${aluno.nome}</h2>
                        <p>Data de Nascimento: ${aluno.dataNasc}</p>
                        <p>Curso: <a href='/cursos/${aluno.curso}'>${aluno.curso}</a></p>
                        <p>Ano de Curso: ${aluno.anoCurso}</p>
                        <p>Instrumento: ${aluno.instrumento}</p>
                    </div>
                `;

                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                return res.end(generateHTML('Aluno', body));
            }

            if (req.url.match(/\/cursos\/.+/)) {
                const id = req.url.split("/")[2];
                const curso = await fetchData(`cursos/${id}`);
                if (!curso) return res.end(generateHTML('Erro', '<h2>Erro ao carregar curso</h2>'));
                const alunos_no_curso = await fetchData(`alunos?curso=${id}`);

                const body = `
                    <div class="section">
                        <h2 class="title">${curso.designacao}</h2>
                        <p>Duração: ${curso.duracao}</p>
                        <p>Instrumento: <a href='/instrumentos/${curso.instrumento.id}'>${curso.instrumento["#text"]}</a></p>
                    </div>

                    <div class="section">
                        <h2 class="title">Alunos Inscritos</h2>
                        <ul>
                            ${alunos_no_curso.map(a => `<li><a href='/alunos/${a.id}'>${a.nome}</a></li>`).join('')}
                        </ul>
                    </div>
                `;

                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                return res.end(generateHTML('Curso', body));
            }

            if (req.url.match(/\/instrumentos\/.+/)) {
                const id = req.url.split("/")[2];
                const instrumento = await fetchData(`instrumentos/${id}`);
                if (!instrumento) return res.end(generateHTML('Erro', '<h2>Erro ao carregar instrumento</h2>'));
                const alunos_que_tocam = await fetchData(`alunos?instrumento=${instrumento["#text"]}`);

                const body = `
                    <div class="section">
                        <h2 class="title">${instrumento["#text"]}</h2>
                        <p>Id do instrumento: ${instrumento.id}</p>
                    </div>

                    <div class="section">
                        <h2 class="title">Alunos que Tocam</h2>
                        <ul>
                            ${alunos_que_tocam.map(a => `<li><a href='/alunos/${a.id}'>${a.nome}</a></li>`).join('')}
                        </ul>
                    </div>
                `;

                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                return res.end(generateHTML('Instrumento', body));
            }
    }
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);