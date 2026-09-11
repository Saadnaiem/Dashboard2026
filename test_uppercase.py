import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Try standard uppercase CSV headers as PostgreSQL column keys!
body = {
    "DIVISION": "TEST DIVISION",
    "BRAND": "TEST BRAND",
    "BRANCH NAME": "TEST BRANCH NAME",
    "ITEM DESCRIPTION": "TEST ITEM DESCRIPTION",
    "2025 CASH SALES": 100,
    "2026 CASH SALES": 200
}

conn = http.client.HTTPSConnection(url)
conn.request("POST", "/rest/v1/sales", headers=headers, body=json.dumps(body))
res = conn.getresponse()
print("Insert Status:", res.status)
print("Insert Response:", res.read().decode("utf-8"))
conn.close()
