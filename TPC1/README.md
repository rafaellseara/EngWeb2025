# TPC1: Oficina de Reparações

2025-02-18

## Autor:

- Rafael Lopes Seara
- A104094 

### Problema

Pretende-se construir um serviço em Node.js, que consuma uma API de dados servida por um json-server de uma oficina de reparações e responda com as páginas web do site.

## Funcionamento

Para melhorar a organização dos dados e evitar redundâncias, desenvolvi um script em Python que reformata o dataset original antes de ser utilizado pelo json-server. A nova estrutura de dados separa informações sobre clientes, viaturas e intervenções, facilitando a consulta e manutenção. O servidor Node.js foi implementado utilizando o módulo http e a biblioteca axios para comunicação com o json-server. As páginas HTML geradas dinamicamente apresentam a lista de clientes e os dados específicos de cada um, incluindo veículos e histórico de reparações.

## Instrução de utilização

Depois de ter o servidor JSON com o conjunto de dados estruturado a correr na porta 3000, pode iniciar o servidor executando o seguinte comando:

```
$ npm run start
```

No entanto, antes de o fazer, é necessário garantir que as dependências estão instaladas. Para isso, deve correr o comando:

```
$ npm install
```