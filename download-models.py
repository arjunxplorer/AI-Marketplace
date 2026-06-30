"""
Download models to RunPod volume caches.
Run this AFTER deploying the Flash endpoints.

Usage:
    python download-models.py
"""
import asyncio
import os
from runpod_flash import Endpoint, GpuType, DataCenter, NetworkVolume

# Import the download endpoints from each Flash app
# These must be deployed first

async def download_all():
    """Trigger model downloads on all endpoints."""

    print("=" * 50)
    print("  Model Download Script")
    print("=" * 50)
    print()
    print("This will download models to your RunPod volumes.")
    print("Each download runs on a GPU worker and may take 5-30 minutes.")
    print()

    # You can call the download endpoints using the Flash SDK
    # The endpoints must be deployed first

    models = [
        {
            "name": "Llama 3.2 3B Instruct",
            "id": "flash-llama-downloader",
            "size": "~6GB",
        },
        {
            "name": "Whisper Large v3",
            "id": "flash-whisper-downloader",
            "size": "~3GB",
        },
        {
            "name": "BGE Large EN v1.5",
            "id": "flash-bge-downloader",
            "size": "~1.3GB",
        },
        {
            "name": "FLUX.1-dev",
            "id": "flash-flux-downloader",
            "size": "~24GB",
        },
    ]

    print("Models to download:")
    for m in models:
        print(f"  - {m['name']} ({m['size']})")
    print()

    print("To download each model, run:")
    print()
    for m in models:
        print(f"  # {m['name']}")
        print(f"  flash run {m['id']} '{{}}'")
        print()

    print("Or use the Flash CLI interactively:")
    print("  flash dev --auto-provision")
    print()
    print("Then trigger downloads from the API explorer at http://localhost:8888/docs")


if __name__ == "__main__":
    asyncio.run(download_all())
