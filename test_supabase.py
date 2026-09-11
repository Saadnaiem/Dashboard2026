import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9"
}

conn = http.client.HTTPSConnection(url)

# 1. Fetch sales table schema or sample rows
print("Attempting to query public table 'sales'...")
conn.request("GET", "/rest/v1/sales?limit=5", headers=headers)
res = conn.getresponse()
print("Status:", res.status)
print("Headers:", dict(res.getheaders()))
data = res.read().decode("utf-8")
print("Response data:")
try:
    parsed = json.loads(data)
    print(json.dumps(parsed, indent=2))
except Exception:
    print(data)

# 2. Try to query /rest/v1/ to see table list
print("\nAttempting to query API OpenAPI schema...")
conn.request("GET", "/rest/v1/", headers=headers)
res = conn.getresponse()
data_api = res.read().decode("utf-8")
try:
    parsed_api = json.loads(data_api)
    if "definitions" in parsed_api:
        print("Available tables:", list(parsed_api["definitions"].keys()))
    else:
        print("Keys:", list(parsed_api.keys()))
except Exception:
    print("Failed to get OpenAPI schema:", data_api[:200])

conn.close()
