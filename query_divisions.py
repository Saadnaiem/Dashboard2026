import http.client
import json

url = "ljivnxqqhfumvuoogsqq.supabase.co"
headers = {
    "apikey": "sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9",
    "Authorization": "Bearer sb_publishable_OdVHxOVLYLgZ0CTdRZx4rw_aKjMbjO9"
}

conn = http.client.HTTPSConnection(url)
all_divs = set()
has_more = True
last_id = 0
total_count = 0
while has_more:
    conn.request("GET", f"/rest/v1/sales?select=id,DIVISION&id=gt.{last_id}&order=id.asc&limit=10000", headers=headers)
    res = conn.getresponse()
    rows = json.loads(res.read().decode("utf-8"))
    if not rows:
        has_more = False
        break
    for r in rows:
        if r.get("DIVISION"):
            all_divs.add(r["DIVISION"])
    last_id = rows[-1]["id"]
    total_count += len(rows)
    if len(rows) < 10000:
        has_more = False

print("All distinct divisions in entire database:", all_divs)
print("Total rows loaded:", total_count)
conn.close()
