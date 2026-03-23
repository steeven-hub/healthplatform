import asyncio
import websockets
import json

async def test_chat():
    # URL de la session ID 1 que nous venons de créer
    uri = "ws://127.0.0.1:8000/ws/chat/1/"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("--- Connecté au WebSocket d'AfriHealth ---")
            
            # 1. Préparer le message
            data = {"message": "Hello depuis le terminal de Wilson !"}
            
            # 2. Envoyer le message
            await websocket.send(json.dumps(data))
            print(f"> Message envoyé : {data['message']}")
            
            # 3. Attendre la réponse (le serveur renvoie le message à tout le groupe)
            response = await websocket.recv()
            result = json.loads(response)
            print(f"< Réponse reçue du serveur : {result['message']}")
            
    except Exception as e:
        print(f"Erreur de connexion : {e}")
        print("Vérifie que ton serveur 'python manage.py runserver' tourne toujours !")

if __name__ == "__main__":
    asyncio.run(test_chat())