"""
BGE Embeddings Flash Endpoint
Model caching via NetworkVolume at /runpod-volume/
"""
import os
from runpod_flash import Endpoint, GpuType, DataCenter, NetworkVolume

# Persistent volume for model cache
vol = NetworkVolume(
    name="bge-model-cache",
    size=30,
    datacenter=DataCenter.US_CA_2,
)

MODEL_ID = "BAAI/bge-large-en-v1.5"
CACHE_DIR = "/runpod-volume/models"


@Endpoint(
    name="flash-bge",
    gpu=GpuType.NVIDIA_GEFORCE_RTX_4090,
    gpu_count=1,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 3),
    idle_timeout=120,
    dependencies=[
        "torch>=2.0.0",
        "transformers>=4.36.0",
        "sentence-transformers>=2.2.0",
        "numpy",
    ],
    env={
        "MODEL_ID": MODEL_ID,
        "CACHE_DIR": CACHE_DIR,
        "HF_HUB_OFFLINE": "1",
        "TRANSFORMERS_OFFLINE": "1",
    },
    flashboot=True,
    execution_timeout_ms=60000,
)
async def embed(texts: list, compare_texts: list = None) -> dict:
    """
    Text embedding endpoint using BGE Large.

    Args:
        texts: List of texts to embed (or single string)
        compare_texts: Optional list of texts to compare against

    Returns:
        dict with 'embeddings', 'dimensions', and optional 'similarities'
    """
    import numpy as np
    from sentence_transformers import SentenceTransformer

    cache_dir = os.getenv("CACHE_DIR")
    model_path = f"{CACHE_DIR}/bge-large-en-v1.5"

    # Load model from cache
    model = SentenceTransformer(model_path)

    # Normalize input
    if isinstance(texts, str):
        texts = [texts]

    # Generate embeddings
    embeddings = model.encode(texts, normalize_embeddings=True)
    embeddings_list = embeddings.tolist()

    result = {
        "embeddings": embeddings_list,
        "dimensions": len(embeddings_list[0]) if embeddings_list else 0,
        "count": len(embeddings_list),
    }

    # Calculate similarities if comparison texts provided
    if compare_texts:
        if isinstance(compare_texts, str):
            compare_texts = [compare_texts]

        compare_embeddings = model.encode(compare_texts, normalize_embeddings=True)

        similarities = []
        for i, emb1 in enumerate(embeddings):
            for j, emb2 in enumerate(compare_embeddings):
                sim = float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))
                similarities.append({
                    "text_a": texts[i],
                    "text_b": compare_texts[j],
                    "similarity": sim,
                })

        result["similarities"] = similarities

    return result


@Endpoint(
    name="flash-bge-downloader",
    gpu=GpuType.NVIDIA_GEFORCE_RTX_4090,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 1),
    dependencies=["huggingface_hub", "sentence-transformers"],
    env={"HF_TOKEN": os.environ.get("HF_TOKEN", "")},
)
async def download_model(_) -> dict:
    """
    One-time model download endpoint.
    Run this first to populate the volume cache.
    """
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=f"{CACHE_DIR}/bge-large-en-v1.5",
        token=os.getenv("HF_TOKEN"),
    )

    return {"status": "downloaded", "model": MODEL_ID, "path": CACHE_DIR}
