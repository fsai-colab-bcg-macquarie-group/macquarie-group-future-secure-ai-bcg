import requests
import os
def test_vectorise():
    url = "http://localhost:8000/vectorise/"
    file_path = os.path.join(os.path.dirname(__file__), "data", "barack_obama.txt")
    with open(file_path, "rb") as f:
        files = {"file": ('barack_obama.txt', f, "text/plain")}
        data = {
            "chunking_strategy": "fixed",
            "chunk_size": 8000,
            "chunk_overlap": 1000,
            "contextualise_src_chunk": False,
            "collection_name": "test_bm25"
        }
        response = requests.post(url, files=files, data=data)
        
    assert response.status_code == 200
    data = response.json()
    
    assert "vectoriser_id" in data
    assert "parameters" in data
    assert data["parameters"]["chunking_strategy"] == "fixed"
    assert data["parameters"]["chunk_size"] == 8000
    assert data["parameters"]["chunk_overlap"] == 1000
    assert data["parameters"]["contextualise_src_chunk"] is False
    assert data["parameters"]["collection_name"] == "test_bm25"
    assert data["num_chunks"] > 0
    assert isinstance(data["first_chunk"], str)

    return data["vectoriser_id"]  # Return the vectoriser ID for further tests  



def test_retrieve():
    id = test_vectorise()
    print(f"Vectoriser ID: {id}")
    # Ensure the vectoriser ID is valid and exists in the store
    if not id:
        raise ValueError("No vectoriser ID returned from vectorise test.")
    url = "http://localhost:8000/retrieve/"
    vectoriser_id = id # Use the vectoriser ID returned from the vectorise test
    query = "What is Barack Obama's full name?"
    
    response = requests.post(url, data={"vectoriser_id": vectoriser_id, "query": query})
    
    assert response.status_code == 200
    data = response.json()

    assert "results" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) > 0
    assert "text" in data["results"][0]
    assert "score" in data["results"][0]
    assert isinstance(data["results"][0]["text"], str)
    assert isinstance(data["results"][0]["score"], float)


