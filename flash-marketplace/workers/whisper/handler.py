import os
import runpod
import whisper

MODEL_ID = os.environ.get("MODEL_NAME", "openai/whisper-large-v3")
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

# Load Whisper model
model = whisper.load_model("large-v3", download_root=LOCAL_MODEL_PATH)

print("[ModelStore] Whisper model loaded from local snapshot")


def handler(job):
    """
    Handler function for speech-to-text requests.

    Args:
        job: Runpod job object containing input data

    Returns:
        Dictionary with transcription or error information
    """
    job_input = job.get("input", {}) or {}
    audio_base64 = job_input.get("audio", "")
    language = job_input.get("language", None)
    task = job_input.get("task", "transcribe")  # transcribe or translate

    print(f"[Handler] Task: {task}")
    print(f"[Handler] Language: {language or 'auto-detect'}")

    try:
        import tempfile
        import base64

        # Decode base64 audio to temporary file
        audio_bytes = base64.b64decode(audio_base64)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Transcribe audio
        options = {"task": task}
        if language:
            options["language"] = language

        result = model.transcribe(tmp_path, **options)

        # Clean up temp file
        os.unlink(tmp_path)

        # Format segments with timestamps
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip(),
            })

        print(f"[Handler] Transcription complete: {len(result['text'])} chars")

        return {
            "status": "success",
            "text": result["text"],
            "language": result.get("language", language),
            "segments": segments,
        }

    except Exception as e:
        print(f"[Handler] Error during transcription: {e}")
        return {
            "status": "error",
            "error": str(e),
        }


runpod.serverless.start({"handler": handler})
