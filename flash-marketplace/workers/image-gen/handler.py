import os
import runpod
import torch
from diffusers import DiffusionPipeline

MODEL_ID = os.environ.get("MODEL_NAME", "black-forest-labs/FLUX.1-dev")
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

    # Try to read the snapshot hash from refs/main
    if os.path.isfile(refs_main):
        with open(refs_main, "r") as f:
            snapshot_hash = f.read().strip()
        candidate = os.path.join(snapshots_dir, snapshot_hash)
        if os.path.isdir(candidate):
            print(f"[ModelStore] Using snapshot from refs/main: {candidate}")
            return candidate

    # Fall back to first available snapshot
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

# Load diffusion pipeline
pipe = DiffusionPipeline.from_pretrained(
    LOCAL_MODEL_PATH,
    torch_dtype=torch.bfloat16,
    device_map="auto",
    local_files_only=True,
)

print("[ModelStore] Image generation model loaded from local snapshot")


def handler(job):
    """
    Handler function for image generation requests.

    Args:
        job: Runpod job object containing input data

    Returns:
        Dictionary with generated image or error information
    """
    job_input = job.get("input", {}) or {}
    prompt = job_input.get("prompt", "A beautiful sunset over the ocean")
    negative_prompt = job_input.get("negative_prompt", "")
    width = int(job_input.get("width", 1024))
    height = int(job_input.get("height", 1024))
    num_steps = int(job_input.get("num_inference_steps", 28))
    guidance_scale = float(job_input.get("guidance_scale", 3.5))
    seed = job_input.get("seed", None)

    print(f"[Handler] Prompt: {prompt[:80]!r}")
    print(f"[Handler] Size: {width}x{height}, Steps: {num_steps}")

    try:
        # Set seed for reproducibility if provided
        generator = None
        if seed is not None:
            generator = torch.Generator(device="cpu").manual_seed(int(seed))

        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt if negative_prompt else None,
            width=width,
            height=height,
            num_inference_steps=num_steps,
            guidance_scale=guidance_scale,
            generator=generator,
        )

        image = result.images[0]

        # Convert to base64 for API response
        import io
        import base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        print(f"[Handler] Image generated successfully")

        return {
            "status": "success",
            "image": image_base64,
            "parameters": {
                "prompt": prompt,
                "width": width,
                "height": height,
                "steps": num_steps,
                "guidance_scale": guidance_scale,
                "seed": seed,
            },
        }

    except Exception as e:
        print(f"[Handler] Error during generation: {e}")
        return {
            "status": "error",
            "error": str(e),
        }


runpod.serverless.start({"handler": handler})
