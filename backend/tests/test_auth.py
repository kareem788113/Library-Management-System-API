def test_register(test_client):
    response = test_client.post("/auth/register", json={
        "username": "testuser",
        "password": "123456"
    })

    assert response.status_code == 200


def test_login(test_client):
    response = test_client.post("/auth/login", json={
        "username": "testuser",
        "password": "123456"
    })

    assert response.status_code == 200
    assert "access_token" in response.json()