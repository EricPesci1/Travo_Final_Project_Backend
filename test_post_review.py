import urllib.request
import urllib.error
import json

BASE_URL = "http://ec2-34-208-202-251.us-west-2.compute.amazonaws.com:8000/api"

payload = {
    "username": "testuser",
    "city_name": "Portland",
    "state_name": "Oregon",
    "rating": 4,
    "description": "Great city for outdoor activities.",
    "pros": "Food scene\nParks\nPublic transit",
    "cons": "Rain\nTraffic",
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    f"{BASE_URL}/reviews/",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST",
)

print(f"POST {BASE_URL}/reviews/")
print(f"Payload: {json.dumps(payload, indent=2)}\n")

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = json.loads(resp.read())
        print(f"SUCCESS — HTTP {resp.status}")
        print(json.dumps(body, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP ERROR {e.code}: {e.reason}")
    print(body[:500])
except urllib.error.URLError as e:
    print(f"CONNECTION ERROR: {e.reason}")
    print("The server may be down or the hostname is unreachable.")
