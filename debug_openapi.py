import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9"
}

conn = http.client.HTTPSConnection(url)
conn.request("GET", "/rest/v1/", headers=headers)
res = conn.getresponse()
body = res.read().decode("utf-8")
print("Status:", res.status)
print("Response:", body)
conn.close()
