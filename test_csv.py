import http.client

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Accept": "text/csv"
}

conn = http.client.HTTPSConnection(url)
conn.request("GET", "/rest/v1/sales?limit=3", headers=headers)
res = conn.getresponse()
print("Status:", res.status)
print("CSV Header + Rows:")
print(res.read().decode("utf-8"))
conn.close()
