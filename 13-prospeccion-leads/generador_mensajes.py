import os
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

def generar_mensaje(nombre, puesto, empresa):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    
    prompt = f"""
    Eres un experto en ventas industriales B2B en México. 
    Escribe un mensaje corto y profesional para LinkedIn o correo electrónico dirigido a {nombre}, que trabaja como {puesto} en {empresa}.
    
    El objetivo es ofrecer servicios de RENTA DE MONTACARGAS de alta disponibilidad para "Montacargas del Norte".
    San Luis Potosí es la ubicación clave.
    El tono debe ser ejecutivo, directo y enfocado en resolver problemas de logística y paros de línea.
    
    Estructura:
    1. Gancho (referencia a la industria o puesto).
    2. Problema (menciona que los equipos fallando detienen la producción).
    3. Solución (nuestros montacargas siempre están listos).
    4. CTA (Llamado a la acción suave: ¿podemos platicar 5 min?).
    
    Idioma: Español de México profesional.
    """
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        res_json = response.json()
        return res_json['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"Error generando mensaje: {str(e)}"

if __name__ == "__main__":
    # Prueba rápida
    test_nombre = "Ing. Rodriguez"
    test_puesto = "Gerente de Logística"
    test_empresa = "General Motors SLP"
    
    print(f"--- MENSAJE PARA {test_empresa} ---\n")
    print(generar_mensaje(test_nombre, test_puesto, test_empresa))
