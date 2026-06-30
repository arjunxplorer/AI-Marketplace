import os
import runpod
from sentence_transformers import SentenceTransformer

MODEL_ID = os.environ.get("MODEL_NAME", "BAAI/bge-large-en-v1.5")
HF_CACHE_ROOT = "/runpod-volume/huggingface-cache/hub"

# Force offline mode to use only cached models
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"


def resolve_snapshot_path(model_id: str) -> str:
    """
    Resolve the local snapshot path for a cached model.
    """
    if "/" not in model_id:
        raise ValueError(f"MODEL_ID '{model_id}' is not in 'org/name' format")

    org, name = model_id.split("/", 1)
    model_root = os.path.join(HF_CACHE_ROOT, f"models--{org}--{name}")
    refs_main = os.path.join(model_root, "refs", "main")
    snapshots_dir = os.path.join(model_root, "snapshots")

    print(f"[ModelStore] MODEL_ID: {model_id}")
    print(f"[ModelStore] Model root: {model_root}")

    if os.path.isfile(refs_main):
        with open(refs_main, "r") as f:
            snapshot_hash = f.read().strip()
        candidate = os.path.join(snapshots_dir, snapshot_hash)
        if os.path.isdir(candidate):
            print(f"[ModelStore] Using snapshot from refs/main: {candidate}")
            return candidate

    if not os.path.isdir(snapshots_dir):
        raise RuntimeError(f"[ModelStore] snapshots directory not found: {snapshots_dir}")

    versions = [
        d for d in os.listdir(snapshots_dir) if os.path.isdir(os.path.join(snapshots_dir, d))
    ]

    if not versions:
        raise RuntimeError(f"[ModelStore] No snapshot subdirectories found under {snapshots_dir}")

    versions.sort()
    chosen = os.path.join(snapshots_dir, versions[0])
    print(f"[ModelStore] Using first available snapshot: {chosen}")
    return chosen


# Resolve and load the model at startup
LOCAL_MODEL_PATH = resolve_snapshot_path(MODEL_ID)
print(f"[ModelStore] Resolved local model path: {LOCAL_MODEL_PATH}")

# Load sentence transformer model
model = SentenceTransformer(LOCAL_MODEL_PATH)

print("[ModelStore] Embedding model loaded from local snapshot")


def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors."""
    import numpy as np
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def handler(job):
    """
    Handler function for embedding generation requests.

    Args:
        job: Runpod job object containing input data

    Returns:
        Dictionary with embeddings or error information
    """
    job_input = job.get("input", {}) or {}
    texts = job_input.get("texts", [])
    compare_texts = job_input.get("compare_texts", None)

    if isinstance(texts, str):
        texts = [texts]

    print(f"[Handler] Generating embeddings for {len(texts)} text(s)")

    try:
        import numpy as np

        # Generate embeddings
        embeddings = model.encode(texts, normalize_embeddings=True)
        embeddings_list = embeddings.tolist()

        result = {
            "status": "success",
            "embeddings": embeddings_list,
            "dimensions": len(embeddings_list[0]) if embeddings_list else 0,
            "count": len(embeddings_list),
        }

        # If comparison texts provided, calculate similarity
        if compare_texts:
            if isinstance(compare_texts, str):
                compare_texts = [compare_texts]

            compare_embeddings = model.encode(compare_texts, normalize_embeddings=True)

            similarities = []
            for i, emb1 in enumerate(embeddings):
                for j, emb2 in enumerate(compare_embeddings):
                    sim = cosine_similarity(emb1, emb2)
                    similarities.append({
                        "text_a": texts[i] if i < len(texts) else "",
                        "text_b": compare_texts[j] if j < len(compare_texts) else "",
                        "similarity": sim,
                    })

            result["similarities"] = similarities

        print(f"[Handler] Generated {len(embeddings_list)} embeddings, dims={len(embeddings_list[0])}")

        return result

    except Exception as e:
        print(f"[Handler] Error during embedding: {e}")
        return {
            "status": "error",
            "error": str(e),
        }


runpod.serverless.start({"handler": handler})
