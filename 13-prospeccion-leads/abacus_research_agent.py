import json
import subprocess
import os

# Cargar API Key desde .env manualmente para evitar dependencias
def get_api_key():
    with open('/Users/macbook/Documents/BLENDER ANT/.env', 'r') as f:
        for line in f:
            if line.startswith('ABACUS_API_KEY'):
                return line.split('=')[1].strip()
    return None

API_KEY = get_api_key()
# Usaremos el SearchLLM Deployment que acabamos de activar
DEPLOYMENT_ID = "63fe128e2" 

def abacus_predict(prompt):
    payload = {
        "deploymentId": DEPLOYMENT_ID,
        "predictionArguments": {
            "prompt": prompt
        }
    }
    
    curl_cmd = [
        "curl", "-s", "https://api.abacus.ai/api/predict",
        "-X", "POST",
        "-H", f"apiKey: {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ]
    
    result = subprocess.run(curl_cmd, capture_output=True, text=True)
    try:
        response = json.loads(result.stdout)
        if response.get("success"):
            return response["result"]
        else:
            return f"Error: {response.get('error')}"
    except Exception as e:
        return f"Exception: {str(e)}"

def research_company(company_name):
    print(f"Investigando {company_name} en San Luis Potosí...")
    prompt = f"Investiga noticias recientes (2025-2026) sobre la empresa {company_name} en San Luis Potosí, México. Enfócate en expansiones de planta, nuevas líneas de producción o retos logísticos. Luego, genera un 'gancho de venta' corto y profesional para ofrecer renta de montacargas de alto tonelaje."
    
    return abacus_predict(prompt)

if __name__ == "__main__":
    companies = ["BMW", "Nestle", "Kelloggs"]
    results = {}
    
    for company in companies:
        results[company] = research_company(company)
        print(f"\n--- Resultado para {company} ---\n{results[company]}\n")
    
    # Guardar resultados en un JSON para uso posterior
    with open('/Users/macbook/Documents/BLENDER ANT/PROSPECCION_LEADS/resultados_abacus.json', 'w') as f:
        json.dump(results, f, indent=4)
    print("\nInvestigación completada. Resultados guardados en resultados_abacus.json")
