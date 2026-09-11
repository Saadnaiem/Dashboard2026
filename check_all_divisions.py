import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Prefer": "count=exact"
}

conn = http.client.HTTPSConnection(url)
conn.request("GET", "/rest/v1/sales?select=DIVISION&limit=300000", headers=headers)
res = conn.getresponse()
print("Header Content-Range:", res.getheader("Content-Range"))
data = res.read().decode("utf-8")
conn.close()

try:
    records = json.loads(data)
    divisions = set(r.get("DIVISION") or r.get("division") for r in records if r)
    print("Distinct divisions in Supabase sales table (with big limit):", divisions)
    print("Total records fetched:", len(records))
except Exception as e:
    print("Error:", e, data[:200])
