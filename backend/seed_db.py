import faker
import json
import random
import urllib.request

fake = faker.Faker()
books = []
genres = ['Literature', 'Fantasy', 'Sci-Fi', 'Mystery', 'Non-Fiction', 'History']

for i in range(16):
    books.append({
        "title": fake.catch_phrase().title(),
        "author": fake.name(),
        "rating": float(random.randint(2, 5)),
        "description": fake.paragraph(nb_sentences=8),
        "url": "https://obsidianassembly.com",
        "image_url": f"https://picsum.photos/seed/{random.randint(1,1000)}/400/600"
    })

req = urllib.request.Request('http://localhost:8000/api/bulk-upload/')
req.add_header('Content-Type', 'application/json')
jsondata = json.dumps(books).encode('utf-8')
try:
    urllib.request.urlopen(req, jsondata)
    print("Successfully injected books!")
except Exception as e:
    print(e)
