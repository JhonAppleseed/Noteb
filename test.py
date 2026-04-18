import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpc19hZG1pbiI6MSwiaXNfYmFubmVkIjowLCJleHAiOjE3NzY0MjY4MTV9.pU0SRSAl_V9i9Q6tizAlmHfJeoCh_f0syf7l82L5ToI"

# results = requests.put("http://localhost:8000/adminbanuser/4",
#     headers={
#     "Content-Type": "application/json",
#     "Authorization": f"Bearer {token}"}
# )

results = requests.put("http://localhost:8000/finduser/4",
    headers={
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"},
)

print(results.json())