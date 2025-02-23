# TPC1: Escola de Música

2025-02-23

## Autor:

- Rafael Lopes Seara
- A104094

### Problema

Construir um serviço em nodejs, que consuma a API de dados servida pelo json-server da escola de música (implementada na segunda aula teórica) e sirva um website com as seguintes caraterísticas:

- Página principal: Listar alunos, Listar Cursos, Listar Instrumentos;

- Página de alunos: Tabela com a informação dos alunos (clicando numa linha deve saltar-se para a página de aluno);

- Página de cursos: Tabela com a informação dos cursos (clicando numa linha deve saltar-se para a página do curso onde deverá aparecer a lista de alunos a frequentá-lo);

- Página de instrumentos: Tabela com a informação dos instrumentos (clicando numa linha deve saltar-se para a página do instrumento onde deverá aparecer a lista de alunos que o tocam).

## Funcionamento

Este servidor Node.js utiliza o módulo http para criar um servidor que escuta na porta 4000 e o módulo axios para fazer pedidos HTTP a uma API base localizada em http://localhost:3000. Quando é feito um pedido GET à raiz (/), o servidor obtém dados de alunos, cursos e instrumentos, gerando uma página HTML com essas informações.

Para URLs específicas como /alunos/{id}, /cursos/{id} e /instrumentos/{id}, o servidor obtém e exibe os detalhes do aluno, curso ou instrumento correspondente, respetivamente.

Se ocorrer um erro ao obter os dados, é gerada uma página de erro.

## Instrução de utilização

Depois de ter o servidor JSON com o conjunto de dados estruturado a correr na porta 3000, pode iniciar o servidor executando o seguinte comando:

```
$ node server.js
```