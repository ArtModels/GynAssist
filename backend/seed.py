import json
from firebase.client import get_sync_db

def seed_data():
    """Lee el archivo JSON de perfiles y los carga en la colección 'clients' de Firestore"""
    db = get_sync_db()
    try:
        with open("data/seed_clients.json", "r", encoding="utf-8") as f:
            clients = json.load(f)
            
        for client in clients:
            client_id = client.get("client_id")
            if client_id:
                # Usamos client_id como ID del documento para que sea único y fácil de consultar
                db.collection("clients").document(client_id).set(client)
                print(f"Paciente registrada: {client.get('name')} (ID: {client_id})")
            else:
                print("Error: El cliente no tiene client_id definido.")
                
        print("\nCarga inicial completada exitosamente.")
    except FileNotFoundError:
        print("Error: No se encontró el archivo data/seed_clients.json")
    except Exception as e:
        print(f"Error durante la carga: {e}")

if __name__ == "__main__":
    seed_data()
