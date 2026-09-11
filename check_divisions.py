import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9"
}

conn = http.client.HTTPSConnection(url)
conn.request("GET", "/rest/v1/sales?select=DIVISION", headers=headers)
res = conn.getresponse()
data = res.read().decode("utf-8")
try:
    parsed = json.loads(data)
    divisions = set(r.get("DIVISION") for r in parsed if r.get("DIVISION"))
    print("Distinct DIVISIONS in DB:", divisions)
    print("Total rows in DB:", len(parsed))
except Exception as e:
    print("Error:", e, data[:300])
conn.close()
