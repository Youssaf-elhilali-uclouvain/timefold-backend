# Backend — Maps Communautaires

## Installation

```bash
cd backend
npm install
node server.js
```

Le serveur démarre sur `http://localhost:3000`  
La base de données `levels.db` est créée automatiquement.

---

## Routes disponibles

### GET /levels
Retourne la liste de toutes les maps (métadonnées uniquement).

```json
[
  { "id": 1, "name": "Ma première map", "author": "Alice", "created_at": "2024-01-01 12:00:00" }
]
```

---

### GET /levels/:id
Retourne une map complète avec toutes ses données.

```json
{
  "id": 1,
  "name": "Ma première map",
  "author": "Alice",
  "created_at": "2024-01-01 12:00:00",
  "data": {
    "width": 30,
    "height": 30,
    "entry_pos": { "x": 2, "y": 10 },
    "exit_pos": { "x": 27, "y": 25 },
    "river_start_y": 14,
    "river_height": 3,
    "bridge_center_x": 15,
    "bridge_width": 3,
    "bridge_clearance": 2,
    "turns_per_round": 20,
    "max_echos": 3,
    "teleport_pairs": [],
    "rumble_positions": [],
    "door_positions": [],
    "switch_positions": []
  }
}
```

---

### POST /levels
Sauvegarde une nouvelle map.

**Body JSON :**
```json
{
  "name": "Ma première map",
  "author": "Alice",
  "data": {
    "width": 30,
    "height": 30,
    "entry_pos": { "x": 2, "y": 10 },
    "exit_pos": { "x": 27, "y": 25 },
    "river_start_y": 14,
    "river_height": 3,
    "bridge_center_x": 15,
    "bridge_width": 3,
    "bridge_clearance": 2,
    "turns_per_round": 20,
    "max_echos": 3,
    "teleport_pairs": [],
    "rumble_positions": [],
    "door_positions": [],
    "switch_positions": []
  }
}
```

**Réponse :**
```json
{ "id": 1, "message": "Level sauvegardé !" }
```

---

### DELETE /levels/:id
Supprime une map par son id.
