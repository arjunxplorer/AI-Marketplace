"""
FLUX Image Generation Flash Endpoint
Model caching via NetworkVolume at /runpod-volume/
"""
import os
from runpod_flash import Endpoint, GpuType, DataCenter, NetworkVolume

# Persistent volume for model cache (FLUX is large ~24GB)
vol = NetworkVolume(
    name="flux-model-cache",
    size=100,
    datacenter=DataCenter.US_CA_2,
)

MODEL_ID = "black-forest-labs/FLUX.1-dev"
CACHE_DIR = "/runpod-volume/models"


@Endpoint(
    name="flash-flux",
    gpu=GpuType.NVIDIA_A100_80GB_PCIe,
    gpu_count=1,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 2),
    idle_timeout=180,
    dependencies=[
        "torch>=2.0.0",
        "diffusers>=0.25.0",
        "transformers>=4.36.0",
        "accelerate>=0.25.0",
        "safetensors",
        "sentencepiece",
        "protobuf",
        "pillow",
    ],
    env={
        "MODEL_ID": MODEL_ID,
        "CACHE_DIR": CACHE_DIR,
        "HF_HUB_OFFLINE": "1",
        "TRANSFORMERS_OFFLINE": "1",
    },
    flashboot=True,
    execution_timeout_ms=300000,
)
async def generate(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 28,
    guidance_scale: float = 3.5,
    seed: int = None,
) -> dict:
    """
    Image generation endpoint using FLUX.1-dev.

    Args:
        prompt: Text description of the image to generate
        width: Image width (default 1024)
        height: Image height (default 1024)
        num_inference_steps: Number of denoising steps (default 28)
        guidance_scale: Classifier-free guidance scale (default 3.5)
        seed: Random seed for reproducibility (optional)

    Returns:
        dict with 'image' (base64 PNG), 'prompt', and 'parameters'
    """
    import torch
    import base64
    import io
    from diffusers import DiffusionPipeline

    cache_dir = os.getenv("CACHE_DIR")
    model_path = f"{CACHE_DIR}/FLUX.1-dev"

    # Load pipeline from cache
    pipe = DiffusionPipeline.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        local_files_only=True,
    )

    # Set seed for reproducibility
    generator = None
    if seed is not None:
        generator = torch.Generator(device="cpu").manual_seed(int(seed))

    # Generate image
    result = pipe(
        prompt=prompt,
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        generator=generator,
    )

    image = result.images[0]

    # Convert to base64
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "image": image_base64,
        "prompt": prompt,
        "parameters": {
            "width": width,
            "height": height,
            "steps": num_inference_steps,
            "guidance_scale": guidance_scale,
            "seed": seed,
        },
    }


@Endpoint(
    name="flash-flux-downloader",
    gpu=GpuType.NVIDIA_A100_80GB_PCIe,
    datacenter=DataCenter.US_CA_2,
    volume=vol,
    workers=(0, 1),
    dependencies=["huggingface_hub"],
    env={"HF_TOKEN": os.environ.get("HF_TOKEN", "")},
)
async def download_model(_) -> dict:
    """
    One-time model download endpoint.
    Run this first to populate the volume cache.
    FLUX is ~24GB, this may take several minutes.
    """
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=f"{CACHE_DIR}/FLUX.1-dev",
        token=os.getenv("HF_TOKEN"),
    )

    return {"status": "downloaded", "model": MODEL_ID, "path": CACHE_DIR}
