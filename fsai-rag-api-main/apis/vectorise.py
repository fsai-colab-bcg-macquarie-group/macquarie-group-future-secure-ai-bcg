from fastapi import FastAPI, UploadFile, File, Form
from typing import Optional
import shutil
import os
from fsai_rag.vectoriser.SparseVectoriserConfig import (
    SparseVectoriserConfig,
    get_baseline_sparse_vectoriser_config,
)
from fsai_rag.vectoriser.SparseVectoriser import SparseVectoriser
from fsai_rag.retriever.SparseRetriever import SparseRetriever, SparseRetrieverConfig
import uuid
from fastapi import HTTPException

app = FastAPI()

VECTORISER_STORE = {}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/vectorise/")
def vectorise(
    file: UploadFile = File(...),
    chunking_strategy: Optional[str] = Form("fixed"),
    chunk_size: Optional[int] = Form(8000),
    chunk_overlap: Optional[int] = Form(1000),
    contextualise_src_chunk: Optional[bool] = Form(False),
    collection_name: Optional[str] = Form("test_bm25"),
):
    # Save uploaded file
    file_location = f"./tmp/{file.filename}"
    os.makedirs("./tmp", exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    sparse_vectoriser_config = get_baseline_sparse_vectoriser_config()

    sparse_vectoriser_config.splitter_config.chunking_strategy = chunking_strategy
    sparse_vectoriser_config.splitter_config.chunk_size = chunk_size
    sparse_vectoriser_config.splitter_config.chunk_overlap = chunk_overlap
    sparse_vectoriser_config.contextualisor_config.contextualise_src_chunk = (
        contextualise_src_chunk
    )

    vectoriser = SparseVectoriser(
        file_paths=[file_location],
        sparse_vectoriser_config=sparse_vectoriser_config,
    )

    vectoriser_id = str(uuid.uuid4())
    VECTORISER_STORE[vectoriser_id] = vectoriser

    return {
        "vectoriser_id": vectoriser_id,
        "parameters": {
            "chunking_strategy": sparse_vectoriser_config.splitter_config.chunking_strategy,
            "chunk_size": sparse_vectoriser_config.splitter_config.chunk_size,
            "chunk_overlap": sparse_vectoriser_config.splitter_config.chunk_overlap,
            "contextualise_src_chunk": sparse_vectoriser_config.contextualisor_config.contextualise_src_chunk,
            "collection_name": collection_name,
        },
        "num_chunks": len(vectoriser.nodes),
        "first_chunk": vectoriser.nodes[0].text if vectoriser.nodes else "",
    }


@app.post("/retrieve/")
def retrieve(
    vectoriser_id: str = Form(...),
    query: str = Form(...),
    sparse_top_k: Optional[int] = Form(1),
):
    vectoriser = VECTORISER_STORE.get(vectoriser_id)
    if not vectoriser:
        raise HTTPException(
            status_code=404,
            detail="Vectoriser ID not found. Please vectorise your file first.",
        )

    sparse_retriever_config = SparseRetrieverConfig(
        sparse_top_k=sparse_top_k,
        sparse_vectoriser_config=vectoriser.sparse_vectoriser_config,
    )
    retriever = SparseRetriever(
        sparse_retriever_config=sparse_retriever_config,
        sparse_vectoriser=vectoriser,
    )
    results = retriever.retriever.retrieve(query)

    return {
        "query": query,
        "results": [{"score": r.score, "text": r.node.text} for r in results],
    }