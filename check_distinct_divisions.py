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
conn.close()

try:
    records = json.loads(data)
    divisions = set(r.get("DIVISION") or r.get("division") for r in records)
    print("Distinct divisions in Supabase sales table:", divisions)
    print("Total rows returned:", len(records))
except Exception as e:
    print("Error:", e, data[:200])
