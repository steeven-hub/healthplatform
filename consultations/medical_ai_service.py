import google.generativeai as genai
from django.conf import settings

class MedicalAIService:
    def __init__(self):
        # Configure le SDK avec la clé API récupérée depuis les réglages Django
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_symptoms(self, symptoms, medical_history):
        """
        Analyse les symptômes et les antécédents médicaux via Gemini.
        """
        prompt = f"""
        Antécédents du patient: {medical_history}
        Symptômes actuels: {symptoms}
        
        Agissez comme un assistant médical intelligent. Fournissez :
        1. Des pistes de diagnostic possibles.
        2. Des suggestions d'examens complémentaires.
        ATTENTION : Ceci est une aide à la décision, pas un diagnostic définitif.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {"result": response.text}
        except Exception as e:
            return {"error": str(e)}
