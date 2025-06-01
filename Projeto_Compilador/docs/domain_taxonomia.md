# Domínio de Conteúdos e Taxonomia

## 1. Tipos de item
| Nome do Tipo         | Descrição breve                                  |
| -------------------- | ------------------------------------------------ |
| Foto                 | Imagem fotográfica do utilizador ou evento       |
| Texto                | Entrada de diário em formato de texto            |
| Resultado Académico  | Nota ou certificação académica                   |
| Resultado Desportivo | Score ou estatística de atividade física         |
| Ficheiro             | Qualquer ficheiro binário (PDF, ZIP, etc.)       |
| Evento               | Descrição de evento (data, local, participantes) |

## 2. Metadados comuns
Para **todos** os tipos de item, definimos:
- **id**: identificador único (UUID)
- **data_registo**: timestamp de criação
- **autor**: quem criou o item
- **tipo**: corresponde ao “Nome do Tipo”
- **visibilidade**: pública / privada / restrita
- **classificadores**: tags ou categorias (ver secção 3)

## 3. Metadados específicos por tipo
### 3.1. Foto
- `resolução` (px)
- `formato` (JPEG, PNG…)
- `legenda` (texto curto)

### 3.2. Texto
- `título`
- `conteúdo` (markdown ou HTML)
- `resumo` (até 200 carateres)

### 3.3 Resultado Académico
- `instituição` (nome da escola, universidade, etc.)
- `disciplina ou curso`
- `nota (valor numérico ou conceito: p.ex. 18, A+)`
- `escala` (ex: 0-20, A-F, 1-5)
- `data_avaliação` (data da avaliação ou emissão do certificado)

### 3.4. Resultado Desportivo
- `atividade` (ex: corrida, futebol, ginásio)
- `valor` (tempo, distância, pontuação… dependendo da atividade)
- `unidade` (ex: km, pontos, minutos)
- `local` (onde decorreu a atividade)
- `data_atividade` (data do evento ou medição)

### 3.5. Ficheiro
- `nome_original` (nome do ficheiro no upload)
- `tamanho` (em bytes)
- `formato` (extensão ou tipo MIME, ex: PDF, ZIP)
- `descrição` (breve explicação do conteúdo)

### 3.6. Evento
- `título` (nome do evento)
- `data_inicio` / `data_fim` (datas e horas)
- `local` (nome ou coordenadas)
- `participantes` (lista de nomes ou identificadores)
- `descrição` (texto livre sobre o evento)
- `tipo_evento` (opcional: p.ex. conferência, festa, treino)

## 4. Taxonomia (vocabulário controlado)
- **Temas gerais**: p.ex. `pessoal`, `saúde`, `estudo`, `desporto`, `lazer`
- **Subcategorias**: p.ex. sobre `desporto`: `corrida`, `ciclismo`, `natação`
- **Níveis de privacidade**: `público`, `amigos`, `só eu`
- **Etiquetagem livre**: permitimos ainda tags livres, mas associadas a termos do vocabulário

## 5. Uso na aplicação
- Na **timeline**: ordenação estritamente por `data_registo`  
- Nas **páginas temáticas**: filtragem por `classificadores` + navegação por hierarquia da taxonomia  
