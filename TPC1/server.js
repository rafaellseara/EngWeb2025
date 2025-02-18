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
};

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
                    background-color: #ffffff;
                    color: #444;
                }
                h1 {
                    font-size: 2.5em;
                    text-align: center;
                    color: #4CAF50;
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
                    background-color: #ffffff;
                }
                .title {
                    font-size: 1.2em;
                    font-weight: 600;
                    color: #333;
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

const server = http.createServer(async (req, res) => {

    // Página de clientes (rota principal)
    if (req.url === '/' && req.method === 'GET') {

        const clients = await fetchData('clients');
        if (!clients) return res.end(generateHTML('Erro', '<h2>Erro ao carregar dados</h2>'));
        
        const body = `<div class="section"><h2>Clientes</h2>
            ${clients.map(c => `<p><a class="title" href="/client/${c.nif}">${c.name} (NIF: ${c.nif})</a></p>`).join('')}
        </div>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(generateHTML('Oficina', body));
    }
    
    // Página de detalhes de um cliente
    if (req.url.startsWith('/client/') && req.method === 'GET') {
        const nif = req.url.split('/')[2];
        const clientData = await fetchData(`clients?nif=${nif}`);
        if (!clientData || clientData.length === 0) {
            res.writeHead(404);
            return res.end(generateHTML('Erro', '<h2>Cliente não encontrado</h2>'));
        }
        
        const client = clientData[0];
        const vehicles = (await fetchData('vehicles'))?.filter(v => v.owners.includes(Number(nif))) || [];
        const operations = await fetchData('operations') || [];
        
        const history = client.repair_history.map(r => `
            <li>Data: ${r.date}, Veículo: ${r.vehicle}<ul>
                ${r.interventions.map(code => {
                    const op = operations.find(o => o.code === code);
                    return `<li>${op ? `${op.name}: ${op.description}` : code}</li>`;
                }).join('')}
            </ul></li>`).join('');
        
        const body = `
            <div class="section"><h2>Dados do Cliente</h2><p class="title">NIF: ${client.nif}</p></div>
            <div class="section"><h2>Veículos</h2>
                ${vehicles.map(v => `<p class="title">${v.brand} ${v.model} (${v.license_plate})</p>`).join('')}
            </div>
            <div class="section"><h2>Histórico</h2><ul>${history}</ul></div>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(generateHTML(client.name, body));
    }
    
    // Página não encontrada
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(generateHTML('Erro', '<h2>404 - Página não encontrada</h2>'));
});

server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}/`));
