def get_token(client):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "123456"
    })
    return response.json()["access_token"]


def test_get_books(test_client):
    response = test_client.get("/books/")
    assert response.status_code == 200


def test_create_book(test_client):
    token = get_token(test_client)

    response = test_client.post(
        "/books/",
        json={
            "title": "Test Book",
            "author": "Test",
            "available_copies": 3
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200