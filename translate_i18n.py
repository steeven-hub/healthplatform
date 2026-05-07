import json
import requests
import os

# Liste des langues cibles (codes ISO)
LANGUAGES = {
    'en': 'English', 'es': 'Español', 'de': 'Deutsch', 'it': 'Italiano', 
    'pt': 'Português', 'zh': '中文', 'ar': 'العربية', 'ru': 'Русский', 
    'ja': '日本語', 'ko': '한국어', 'hi': 'हिन्दी', 'tr': 'Türkçe', 
    'nl': 'Nederlands', 'pl': 'Polski', 'sv': 'Svenska', 'da': 'Dansk', 
    'fi': 'Suomi', 'el': 'Ελληνικά', 'cs': 'Čeština'
}

def translate_json(data, target_lang):
    api_key = os.environ.get("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={api_key}"
    
    prompt = f"Traduis les valeurs du JSON suivant en {target_lang}. Retourne UNIQUEMENT le JSON pur, sans aucune explication. Garde les clés identiques.\n{json.dumps(data, ensure_ascii=False)}"
    
    response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    result = response.json()
    
    if 'candidates' not in result:
        print(f"Erreur API pour {target_lang}: {result}")
        raise KeyError('candidates')
    
    try:
        text = result['candidates'][0]['content']['parts'][0]['text']
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print(f"Erreur de parsing pour {target_lang}: {e}")
        raise e

# Charger le français
with open('Health _platform_frontend/src/locales/index.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# Générer les autres langues
for code, name in LANGUAGES.items():
    print(f"Traduction vers {name}...")
    translations[code] = {"translation": translate_json(translations['fr']['translation'], name)}

# Sauvegarder
with open('Health _platform_frontend/src/locales/index.json', 'w', encoding='utf-8') as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)

print("Traduction terminée.")
