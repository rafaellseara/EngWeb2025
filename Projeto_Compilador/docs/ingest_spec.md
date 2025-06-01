# Especificação de Ingestão de SIP

## 1. Objetivo  
Descrever o fluxo, os formatos e as regras de validação para o upload de pacotes SIP (Submission Information Packages).

## 2. Endpoint HTTP  
- **Método:** `POST`  
- **URL:** `/api/ingest`  
- **Content-Type:** `multipart/form-data`  
- **Campos esperados:**  
  - `package`: ficheiro `.zip` contendo o SIP

## 3. Estrutura do SIP  
Dentro do `.zip` deverá existir obrigatoriamente:

```
/
├── manifest-SIP.json # ou .xml
├── data/ # pasta com todos os binários
│ ├── <uuid1>.<ext>
│ ├── <uuid2>.<ext>
│ └── …
└── metadados/ # (opcional) extras, se houver
├── extra1.json
└── …
```


## 4. Regras de Validação  
1. Verificar que existe **exatamente um** arquivo `manifest-SIP.json` ou `manifest-SIP.xml`.  
2. Validar o manifesto contra o _schema_ JSON (veja secção 5).  
3. Conferir que **todos** os ficheiros referenciados no manifesto estão presentes em `/data`.  
4. Se algo falhar, devolver erro `400 Bad Request` com mensagem clara.

## 5. Schema do Manifesto (exemplo JSON)  
```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SIP Manifest",
  "type": "object",
  "required": ["id", "author", "created_at", "items"],
  "properties": {
    "id":          { "type": "string", "format": "uuid" },
    "author":      { "type": "string" },
    "created_at":  { "type": "string", "format": "date-time" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "path"],
        "properties": {
          "type":      { "type": "string" },
          "path":      { "type": "string" },
          "metadata":  { "type": "object" }
        }
      }
    }
  }
}
```