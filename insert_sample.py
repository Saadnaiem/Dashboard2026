import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

body = {
    "division": "DIAGNOSTIC TEST",
    "brand": "TEST BRAND",
    "branch_name": "TEST BRANCH",
    "item_description": "TEST ITEM",
    "sales_2025_cash": 100.0,
    "sales_2025_credit": 50.0,
    "sales_2025_total": 150.0,
    "sales_2026_cash": 200.0,
    "sales_2026_credit": 100.0,
    "sales_2026_total": 300.0
}

conn = http.client.HTTPSConnection(url)
conn.request("POST", "/rest/v1/sales", headers=headers, body=json.dumps(body))
res = conn.getresponse()
print("Insert Status:", res.status)
print("Insert Response Header Content-Range:", res.getheader('Content-Range'))
print("Insert Response:", res.read().decode("utf-8"))
conn.close()
