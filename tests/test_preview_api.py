from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


# AC-1: GET /api/health returns the expected ok status payload.
def test_get_health_returns_ok_status():
    response = client.get('/api/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


# AC-2: GET /api/project-summary returns the agreed contract fields and artifact shape.
def test_get_project_summary_returns_contracted_fields():
    response = client.get('/api/project-summary')

    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {'title', 'repositoryType', 'summary', 'artifacts', 'runNotes'}
    assert isinstance(data['title'], str)
    assert isinstance(data['repositoryType'], str)
    assert isinstance(data['summary'], str)
    assert isinstance(data['artifacts'], list)
    assert isinstance(data['runNotes'], list)

    for artifact in data['artifacts']:
        assert set(artifact.keys()) == {'name', 'path', 'kind'}
        assert isinstance(artifact['name'], str)
        assert isinstance(artifact['path'], str)
        assert isinstance(artifact['kind'], str)
