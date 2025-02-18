import json

# Carregar os dados
with open("dataset_reparacoes.json", encoding="utf-8") as file:
    data = json.load(file)["reparacoes"]

clients, vehicles, operations = {}, {}, {}

for repair in data:
    nif, vehicle_id, date = repair["nif"], repair["viatura"]["matricula"], repair["data"]
    
    clients.setdefault(nif, {"name": repair["nome"], "nif": nif, "repair_history": []})
    
    if vehicle_id not in vehicles:
        vehicles[vehicle_id] = {
            "brand": repair["viatura"]["marca"],
            "model": repair["viatura"]["modelo"],
            "license_plate": vehicle_id,
            "owners": set()
        }
    vehicles[vehicle_id]["owners"].add(nif)
    
    interventions = []
    for op in repair["intervencoes"]:
        code = op["codigo"]
        if code not in operations:
            operations[code] = {
                "code": code,
                "name": op["nome"],
                "description": op["descricao"]
            }
        interventions.append(code)
    
    clients[nif]["repair_history"].append({
        "date": date,
        "vehicle": vehicle_id,
        "interventions": interventions
    })

# Converter sets para listas
for vehicle in vehicles.values():
    vehicle["owners"] = list(vehicle["owners"])

# Salvar resultado
with open("parsed_reparacoes.json", "w", encoding="utf-8") as outfile:
    json.dump({"clients": list(clients.values()), "vehicles": list(vehicles.values()), "operations": list(operations.values())}, outfile, indent=4, ensure_ascii=False)

print("Transformação concluída. Dados salvos em parsed_reparacoes.json.")
