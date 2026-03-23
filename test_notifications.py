import asyncio
import websockets
import json

async def listen_notifications():
    # Connexion au canal global de l'utilisateur ID 1
    uri = "ws://127.0.0.1:8000/ws/notifications/"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("--- 🔔 Service de Notifications AfriHealth Connecté ---")
            print("En attente d'alertes (ne ferme pas ce terminal)...")
            
            while True:
                # Le script reste en écoute permanente
                response = await websocket.recv()
                data = json.loads(response)
                
                print("\n[ALERTE REÇUE]")
                print(f"Message : {data['message']}")
                print(f"Détails : {data.get('data', {})}")
                print("-" * 30)
                
    except Exception as e:
        print(f"Erreur : {e}")
        print("Vérifie que le routing.py inclut bien /ws/notifications/")

if __name__ == "__main__":
    asyncio.run(listen_notifications())