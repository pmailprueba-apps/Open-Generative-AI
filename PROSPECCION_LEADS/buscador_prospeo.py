import urllib.request
import json
import time
import csv

# CONFIGURACIÓN
API_KEY = "pk_7dcdad3cfe02f6c725edc32e4358c454837cf9445dee5a91b656e178fa57b0a9"
DOMAINS = [
    "bmw.com.mx", "nestle.com.mx", "kelloggs.com.mx", 
    "pepsico.com.mx", "kimberly-clark.com.mx", "ternium.com",
    "cmoctezuma.com.mx", "grupogondi.com", "calidra.com",
    "gm.com.mx", "mabe.com.mx", "draexlmaier.com", "bosch.com",
    "continental.com", "daikin.com.mx", "lear.com", "maxionwheels.com",
    "faurecia.com", "valeo.com", "metalsa.com", "cummins.com",
    "logisticsplus.com", "alplogistics.com.mx", "craneww.com", "ramconlogistics.com"
]

def search_people(domain):
    url = "https://api.prospeo.io/search-person"
    data = {
        "page": 1,
        "filters": {
            "company": {
                "websites": { "include": [domain] }
            },
            "person_location_search": { "include": ["Mexico"] }
        }
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-KEY', API_KEY)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {"error": str(e)}

def enrich_person(person_id):
    url = "https://api.prospeo.io/enrich-person"
    data = {"person_id": person_id}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-KEY', API_KEY)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return {"error": str(e)}

def main():
    all_leads = []
    print("Iniciando búsqueda de prospectos en México...")
    
    for domain in DOMAINS:
        print(f"Procesando: {domain}...")
        res = search_people(domain)
        results = res.get('response', {}).get('results', [])
        
        # Filtrar solo cargos interesantes
        keywords = ["Gerente", "Manager", "Director", "Logistica", "Compras", "Operations", "Purchasing"]
        
        for p in results[:5]: # Tomar los primeros 5 de cada empresa para ahorrar créditos
            title = p.get('job_title', '')
            if any(kw.lower() in title.lower() for kw in keywords):
                print(f"  Revelando email para: {p.get('full_name')}...")
                enriched = enrich_person(p.get('person_id'))
                email = enriched.get('response', {}).get('email', {}).get('email', 'No encontrado')
                
                all_leads.append({
                    "Nombre": p.get('full_name'),
                    "Puesto": title,
                    "Empresa": domain,
                    "Email": email
                })
                time.sleep(1)

    # Guardar en CSV
    with open('prospectos_verificados.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["Nombre", "Puesto", "Empresa", "Email"])
        writer.writeheader()
        writer.writerows(all_leads)
    
    print("\n¡Listo! Archivo 'prospectos_verificados.csv' generado con éxito.")

if __name__ == "__main__":
    main()
