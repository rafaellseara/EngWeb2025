# TPC3: Gestão de Filmes

2025-03-24

## Autor:

- Rafael Lopes Seara
- A104094

### Problema

O TPC3 propõe a criação de uma API REST que trata das operações CRUD.

Para isso, como é hábito, há uma página de templates HTML e um *server* JavaScript. No servidor, as operações CRUD estão dispostas num switch:
+ **GET** : fazem as operações de leitura
+ **POST** : fazem as operações de escrita
+ **PUT** : fazem as operações de atualização
+ **DELETE** : fazem as operações de remoção

Para além disso, utiliza-se da ferramenta *forms*, que permite que dados sejam coletados de forma assíncrona, evitando muitas iterações entre servidor e cliente.

## Funcionamento

Este código é uma implementação de um servidor Express que lida com a gestão de filmes, incluindo operações de visualização, adição, edição e exclusão. O servidor define rotas para renderizar páginas e interagir com uma API externa (no caso, `http://localhost:3000/filmes`) usando a biblioteca `axios`. A rota `GET /filmes` recupera e exibe uma lista de filmes ordenados por título, enquanto `GET /filmes/adicionar` exibe um formulário para adicionar novos filmes. O `POST /filmes/adicionar` envia dados para adicionar um novo filme à API. A rota `GET /filmes/editar/:id` carrega os dados de um filme específico para edição, e `POST /filmes/editar/:id` envia as alterações para atualizar o filme. A rota `POST /filmes/delete/:id` exclui um filme pela sua ID. Além disso, há rotas de API, como `DELETE /filmes/:id` e `PUT /filmes/:id`, que permitem a exclusão e atualização de filmes diretamente, retornando códigos de status apropriados. O código também inclui tratamento de erros, redirecionamento e renderização de páginas com base nos dados recebidos.


## Instrução de utilização

Depois de ter o servidor JSON com o conjunto de dados estruturado a correr na porta 3000, pode iniciar o servidor executando o seguinte comando:

```
$ npm run dev
```