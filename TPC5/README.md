# TPC5: Criação de uma App para Gestão de Alunos  

2025-03-29

## Autor:

- Rafael Lopes Seara
- A104094

## Problema

Desenvolvimento de uma aplicação com dois serviços: uma **API de dados** e um **front-end**.  

#### 1. API de Dados  
- Aplicação em **Node.js** que recebe pedidos **REST**.  
- Interage com **MongoDB** para obter e armazenar dados.  
- Responde em **JSON**.  

#### 2. Front-end  
- Aplicação em **Node.js** com interface web usando **templates PUG**.  
- Processa pedidos do utilizador e solicita dados à API de dados quando necessário.  

**Nota:** Ambos os serviços podem ser prototipados com **Express** e desenvolvidos a partir daí. A **API de dados** não incluirá views.  

## Funcionamento

Este código implementa um sistema de gestão de alunos utilizando **Express.js** e **Mongoose** para interação com uma base de dados **MongoDB**. Ele contém rotas para listar, visualizar, adicionar, editar e excluir alunos. O primeiro conjunto de rotas (`router`) lida com as requisições HTTP e utiliza **Axios** para comunicação com a API. A API, definida separadamente, fornece endpoints que manipulam os dados diretamente no banco de dados, utilizando um **modelo Mongoose** (`alunoSchema`) para estruturar os documentos de alunos.

O controlador (`alunos.js`) contém métodos para listar alunos, buscar por ID, inserir novos registros, atualizar informações e excluir alunos da base de dados. Ele também garante que os trabalhos práticos de casa (**TPCs**) sejam representados corretamente como valores booleanos. Assim, o sistema permite uma interface web para gestão de alunos enquanto mantém uma API separada para operações no banco de dados.


## Instrução de utilização

Depois de ter mongoDB com o conjunto de dados estruturado a correr, pode iniciar o servidor executando o seguinte comando:

```
$ npm start
```