# TPC6: Gestão de Contratos

2025-03-31

## Autor:

- Rafael Lopes Seara
- A104094

## Problema

O objetivo deste trabalho foi a implementação de uma API de dados baseada num dataset contendo contratos públicos extraídos do Portal da Transparência. A API deveria ser desenvolvida utilizando **MongoDB** para armazenamento e gestão dos dados, garantindo a persistência das informações. O desafio principal foi estruturar os dados corretamente, permitindo consultas eficientes. Além disso, foi necessário desenvolver um serviço web para exibição dos contratos e entidades associadas, fornecendo funcionalidades como listagem de contratos, detalhamento de uma entidade específica e cálculo do montante total de contratos por entidade.  

## Funcionamento

Para verificar a correta implementação da API, foram utilizados testes via **Postman**, garantindo que todas as rotas respondiam corretamente aos pedidos esperados. A comunicação com a base de dados foi feita através da biblioteca **Mongoose**, facilitando a modelagem dos dados e a execução de operações sobre a base de dados **MongoDB**. As rotas implementadas permitiram a obtenção de contratos filtrados por entidade e tipo de procedimento. Por fim, um serviço web complementar foi desenvolvido para exibir os dados em páginas acessíveis via browser, oferecendo uma interface intuitiva para visualização dos contratos e entidades comunicantes.

## Instrução de utilização

Depois de ter mongoDB com o conjunto de dados estruturado a correr, pode iniciar o servidor api executando o seguinte comando:

```
$ npm start
```

A seguir é só iniciar a aplicação usando o comando:

```
$ npm start
```