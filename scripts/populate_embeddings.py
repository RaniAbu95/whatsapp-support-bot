"""
סקריפט חד-פעמי — מוסיף embeddings לכל שורות knowledge_base שאין להן.
הרצה: python3 scripts/populate_embeddings.py
"""

import httpx
import os
from dotenv import load_dotenv

load_dotenv("webhook-worker/.dev.vars")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL   = os.getenv("SUPABASE_URL")
SUPABASE_KEY   = os.getenv("SUPABASE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def generate_embedding(text: str) -> list[float]:
    res = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_API_KEY}",
        json={"content": {"parts": [{"text": text}]}, "outputDimensionality": 768},
        timeout=30,
    )
    res.raise_for_status()
    return res.json()["embedding"]["values"]

def fetch_rows_without_embedding() -> list[dict]:
    res = httpx.get(
        f"{SUPABASE_URL}/rest/v1/knowledge_base?select=id,question&embedding=is.null",
        headers=HEADERS,
    )
    res.raise_for_status()
    return res.json()

def update_embedding(row_id: int, embedding: list[float]):
    res = httpx.patch(
        f"{SUPABASE_URL}/rest/v1/knowledge_base?id=eq.{row_id}",
        headers=HEADERS,
        json={"embedding": embedding},
    )
    res.raise_for_status()

def main():
    rows = fetch_rows_without_embedding()
    print(f"נמצאו {len(rows)} שורות ללא embedding")

    for i, row in enumerate(rows, 1):
        print(f"[{i}/{len(rows)}] {row['question'][:50]}...")
        embedding = generate_embedding(row["question"])
        update_embedding(row["id"], embedding)
        print(f"  ✓ embedding נשמר ({len(embedding)} ממדים)")

    print("סיום!")

if __name__ == "__main__":
    main()
