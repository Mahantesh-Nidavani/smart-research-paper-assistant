import requests

base = "http://127.0.0.1:5000"

# Upload first
with open("test.pdf", "rb") as f:
    res = requests.post(f"{base}/upload", files={"file": f})
filename = res.json()['filename']

# Test visuals
res8 = requests.post(f"{base}/visuals", json={"filename": filename})
print("Status:", res8.status_code)
print("VISUALS:", res8.json())