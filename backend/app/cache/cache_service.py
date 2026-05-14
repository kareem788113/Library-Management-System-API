import json
from app.cache.redis_client import redis_client

CACHE_KEY_BOOKS = "books_list"


def get_books_cache():
    data = redis_client.get(CACHE_KEY_BOOKS)
    if data:
        print("FROM CACHE")
        return json.loads(data)
    return None


def set_books_cache(data):
    redis_client.set(CACHE_KEY_BOOKS, json.dumps(data), ex=60)


def invalidate_books_cache():
    redis_client.delete(CACHE_KEY_BOOKS)