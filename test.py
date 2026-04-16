import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpc19hZG1pbiI6MSwiZXhwIjoxNzc2MzM1NzMwfQ.52Q9mQ_qjZz1YzGXPuJgIb-8EqfSya5YETR9I83Q-gM"

results = requests.get("http://localhost:8000/usersnotesadmin",
    headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"}
)

print(results.json())