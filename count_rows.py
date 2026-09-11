import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Prefer": "count=exact"
}

conn = http.client.HTTPSConnection(url)
conn.request("GET", "/rest/v1/sales?limit=1", headers=headers)
res = conn.getresponse()
print("Status:", res.status)
print("Headers:", dict(res.getheaders()))
conn.close()
