# Modelagem de Dados

Neste documento descrevemos as coleções do MongoDB, os seus campos (metadados comuns e específicos), índices, a estrutura de armazenamento no file system, e o esquema de logs.

---

## Metadados Comuns a Todas as Coleções

| Field             | Type       | Required | Description                                      |
| ----------------- | ---------- | -------- | ------------------------------------------------ |
| `id`              | String     | Yes      | Unique UUID of the item                          |
| `created_at`      | Date       | Yes      | Creation timestamp (default: now)                |
| `author`          | String     | Yes      | User ID or name                                  |
| `type`            | String     | Yes      | Type name of the item                            |
| `visibility`      | String     | Yes      | `public` / `friends` / `private`                 |
| `tags`            | [String]   | No       | Tags or categories                               |


---

## Fotos

**Descrição:** metadados de imagens fotográficas do utilizador ou evento.

| Field                 | Type          | Required | Description                           |
| --------------------- | ------------- | -------- | ------------------------------------- |
| `id`                  | String (UUID) | Yes      | Unique identifier                     |
| `created_at`          | Date          | Yes      | Creation timestamp                    |
| `author`              | String        | Yes      | User ID or name                       |
| `type`                | String        | Yes      | “Photo”                               |
| `visibility`          | String        | Yes      | `public` / `friends` / `private`      |
| `tags`                | [String]      | No       | Thematic tags                         |
| `resolution.width`    | Number        | No       | Width in pixels                       |
| `resolution.height`   | Number        | No       | Height in pixels                      |
| `format`              | String        | No       | JPEG / PNG / GIF                      |
| `caption`             | String        | No       | Short caption or description          |


**Índices**  
- `created_at: -1`  
- `tags: 1`  
- `author: 1`   

---

## Texts

**Descrição:** entradas de diário em formato de texto.

| Field         | Type          | Required | Description                          |
| ------------- | ------------- | -------- | ------------------------------------ |
| `id`          | String (UUID) | Yes      | Unique identifier                    |
| `created_at`  | Date          | Yes      | Creation timestamp                   |
| `author`      | String        | Yes      | User ID or name                      |
| `type`        | String        | Yes      | “Text”                               |
| `visibility`  | String        | Yes      | `public` / `friends` / `private`     |
| `tags`        | [String]      | No       | Thematic tags                        |
| `title`       | String        | No       | Entry title                          |
| `content`     | String        | Yes      | Markdown or HTML text content        |
| `summary`     | String        | No       | Up to 200 characters summary         |

**Índices**  
- `created_at: -1`  
- `tags: 1`  

---

## Results_Academic

**Descrição:** notas ou certificações académicas.

| Field               | Type          | Required | Description                                    |
| ------------------- | ------------- | -------- | ---------------------------------------------- |
| `id`                | String (UUID) | Yes      | Unique identifier                              |
| `created_at`        | Date          | Yes      | Creation timestamp                             |
| `author`            | String        | Yes      | User ID or name                                |
| `type`              | String        | Yes      | “Academic Result”                              |
| `visibility`        | String        | Yes      | `public` / `friends` / `private`               |
| `tags`              | [String]      | No       | Thematic tags                                  |
| `institution`       | String        | Yes      | Name of school, university, etc.               |
| `subject_or_course` | String        | Yes      | Name of subject or course                      |
| `grade`             | String        | Yes      | Numeric or letter grade (e.g., 18, A+)         |
| `scale`             | String        | Yes      | E.g. “0-20”, “A-F”, “1-5”                      |
| `evaluation_date`   | Date          | Yes      | Date of assessment or certificate issuance     |

**Índices**  
- `created_at: -1`  
- `institution: 1`    

---

## Results_Sport

**Descrição:** estatísticas ou resultados de atividade física.

| Field            | Type          | Required | Description                               |
| ---------------- | ------------- | -------- | ----------------------------------------- |
| `id`             | String (UUID) | Yes      | Unique identifier                         |
| `created_at`     | Date          | Yes      | Creation timestamp                        |
| `author`         | String        | Yes      | User ID or name                           |
| `type`           | String        | Yes      | “Sport Result”                            |
| `visibility`     | String        | Yes      | `public` / `friends` / `private`          |
| `tags`           | [String]      | No       | Thematic tags                             |
| `activity`       | String        | Yes      | E.g., running, football, gym              |
| `value`          | Number/String | Yes      | E.g., time, distance, score               |
| `unit`           | String        | Yes      | E.g., km, points, minutes                 |
| `location`       | String        | No       | Location of the activity                  |
| `activity_date`  | Date          | Yes      | Event or measurement date                 |

**Índices**  
- `created_at: -1`  
- `activity: 1`    

---

## Files

**Descrição:** qualquer ficheiro binário carregado pelo utilizador.

| Field           | Type          | Required | Description                             |
| --------------- | ------------- | -------- | --------------------------------------- |
| `id`            | String (UUID) | Yes      | Unique identifier                       |
| `created_at`    | Date          | Yes      | Creation timestamp                      |
| `author`        | String        | Yes      | User ID or name                         |
| `type`          | String        | Yes      | “File”                                  |
| `visibility`    | String        | Yes      | `public` / `friends` / `private`        |
| `tags`          | [String]      | No       | Thematic tags                           |
| `original_name` | String        | Yes      | Original uploaded file name             |
| `size`          | Number        | Yes      | Size in bytes                           |
| `format`        | String        | Yes      | Extension or MIME (PDF, ZIP, etc.)      |
| `description`   | String        | No       | Short description of the content        |

**Índices**  
- `created_at: -1`  

---

## Events

**Descrição:** descrição de eventos relacionados ao utilizador.

| Field           | Type          | Required | Description                                       |
| --------------- | ------------- | -------- | ------------------------------------------------- |
| `id`            | String (UUID) | Yes      | Unique identifier                                 |
| `created_at`    | Date          | Yes      | Creation timestamp                                |
| `author`        | String        | Yes      | User ID or name                                   |
| `type`          | String        | Yes      | “Event”                                           |
| `visibility`    | String        | Yes      | `public` / `friends` / `private`                  |
| `tags`          | [String]      | No       | Thematic tags                                     |
| `title`         | String        | Yes      | Event name                                        |
| `start_date`    | Date          | Yes      | Start date and time                               |
| `end_date`      | Date          | No       | End date and time (if applicable)                 |
| `location`      | String        | No       | Name or coordinates                               |
| `participants`  | [String]      | No       | List of names or IDs                              |
| `description`   | String        | No       | Free-form text about the event                    |
| `event_type`    | String        | No       | E.g., conference, party, workout                  |

**Índices**  
- `start_date: 1`  
- `title: 1`   

---

## Estrutura de File System

Todos os ficheiros binários são guardados sob a pasta `storage/` com esta organização:

storage/
photos/
<YEAR>/
<MONTH>/
<id>.<extension>
academic_results/
<YEAR>/
<MONTH>/
<id>.<extension>
sports_results/
<YEAR>/
<MONTH>/
<id>.<extension>
files/
<YEAR>/
<MONTH>/
<id>.<extension>
events/
<YEAR>/
<MONTH>/
<id>.<extension>


O MongoDB guarda apenas o caminho relativo (ex.: `photos/2025/05/123e4567-e89b-12d3-a456-426614174000.jpg`).  
O módulo de ingestão cria automaticamente as pastas de ano e mês.

---

## Esquema de Logs

Usaremos Winston para registar em consola (desenvolvimento) e em ficheiro (`logs/app.log`). Cada entrada de log será gravada em JSON:

```json
{
  "timestamp": "2025-05-06T14:30:00Z",
  "level": "info" | "warn" | "error",
  "operation": "ingest" | "create" | "read" | "update" | "delete",
  "user_id": "<user id>",
  "item_id": "<item id>",
  "status": "success" | "failure",
  "message": "additional details"
}
```
