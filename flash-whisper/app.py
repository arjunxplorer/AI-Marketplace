"""
Whisper Flash Endpoint
Model caching via NetworkVolume at /runpod-volume/
"""
import os
from runpod_flash import Endpoint, GpuType, DataCenter, NetworkVolume

# Persistent volume for model cache
vol = NetworkVolume(
    name="whisper-model-cache",
    size=50,
    datacenter=DataCenter.US_CA_2,
)

MODEL_ID = "openai/whisper-large-v3"
CACHE_DIR = "/runpod-volume/models"


@Endpoint(
    name="flash-whisper",
    gpu=GpuType.NVIDIA_GEFORCE_RTX_4090,
    gpu_count=1,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 3),
    idle_timeout=120,
    dependencies=[
        "torch>=2.0.0",
        "transformers>=4.36.0",
        "accelerate>=0.25.0",
        "openai-whisper",
        "librosa",
        "soundfile",
        "numpy",
    ],
    env={
        "MODEL_ID": MODEL_ID,
        "CACHE_DIR": CACHE_DIR,
        "HF_HUB_OFFLINE": "1",
        "TRANSFORMERS_OFFLINE": "1",
    },
    flashboot=True,
    execution_timeout_ms=180000,
)
async def transcribe(audio: str, language: str = None, task: str = "transcribe") -> dict:
    """
    Speech-to-text endpoint using Whisper Large v3.

    Args:
        audio: Base64-encoded audio data
        language: Language code (e.g., 'en', 'es') or None for auto-detect
        task: 'transcribe' or 'translate' (translate to English)

    Returns:
        dict with 'text', 'language', and 'segments' keys
    """
    import base64
    import tempfile
    import whisper

    cache_dir = os.getenv("CACHE_DIR")

    # Load model from cache
    model = whisper.load_model(
        "large-v3",
        download_root=cache_dir,
    )

    # Decode base64 audio to temp file
    audio_bytes = base64.b64decode(audio)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        # Transcribe
        options = {"task": task}
        if language:
            options["language"] = language

        result = model.transcribe(tmp_path, **options)

        # Format segments
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip(),
            })

        return {
            "text": result["text"],
            "language": result.get("language", language),
            "segments": segments,
        }
    finally:
        os.unlink(tmp_path)


@Endpoint(
    name="flash-whisper-downloader",
    gpu=GpuType.NVIDIA_GEFORCE_RTX_4090,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 1),
    dependencies=["huggingface_hub", "openai-whisper"],
    env={"HF_TOKEN": os.environ.get("HF_TOKEN", "")},
)
async def download_model(_) -> dict:
    """
    One-time model download endpoint.
    Run this first to populate the volume cache.
    """
    from huggingface_hub import snapshot_download

    # Download Whisper model
    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=f"{CACHE_DIR}/whisper-large-v3",
        token=os.getenv("HF_TOKEN"),
    )

    return {"status": "downloaded", "model": MODEL_ID, "path": CACHE_DIR}
