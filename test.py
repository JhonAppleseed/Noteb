import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3NzYxMzU2NjB9.76fsc_B8ISXvVWU36YJX6QlK-IbkqhbaYRMS4Zvc4ok"
# respond1 = requests.post("http://localhost:8000/notes", 
#     json={"title": "test", "content": "hello"},
#     headers={"Authorization": f"Bearer {token}"}
# )

respond2 = requests.post("http://localhost:8000/notes",
    json={"title": 'ForJuju', 'content': 'Conentents...'},
    headers={"Authorization": f"Bearer {token}"}
)

# respond = requests.get("http://localhost:8000/notes",
#                        headers={"Authorization": f"Bearer {token}"}
#                        )

# respond3 = requests.delete("http://localhost:8000/notes/3",
#     headers={"Authorization": f"Bearer {token}"}         
# )

print(respond2.json())

