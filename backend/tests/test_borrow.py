def get_token(client):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "123456"
    })
    return response.json()["access_token"]


def test_borrow_book(test_client):
    token = get_token(test_client)

    response = test_client.post(
        "/borrow/1",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code in [200, 400]