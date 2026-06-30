"""
Llama 3.2 Flash Endpoint
Model caching via NetworkVolume at /runpod-volume/
"""
import os
from runpod_flash import Endpoint, GpuType, DataCenter, NetworkVolume

# Persistent volume for model cache
vol = NetworkVolume(
    name="llama-model-cache",
    size=50,
    datacenter=DataCenter.US_CA_2,
)

MODEL_ID = "meta-llama/Llama-3.2-3B-Instruct"
CACHE_DIR = "/runpod-volume/models"


@Endpoint(
    name="flash-llama",
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
        "sentencepiece",
        "protobuf",
    ],
    env={
        "MODEL_ID": MODEL_ID,
        "CACHE_DIR": CACHE_DIR,
        "HF_HUB_OFFLINE": "1",
        "TRANSFORMERS_OFFLINE": "1",
    },
    flashboot=True,
    execution_timeout_ms=120000,
)
async def chat(messages: list, max_tokens: int = 256, temperature: float = 0.7) -> dict:
    """
    Chat endpoint using Llama 3.2.

    Args:
        messages: List of message dicts with 'role' and 'content' keys
        max_tokens: Maximum tokens to generate (default 256)
        temperature: Sampling temperature (default 0.7)

    Returns:
        dict with 'response' key containing generated text
    """
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    model_id = os.getenv("MODEL_ID")
    cache_dir = os.getenv("CACHE_DIR")

    # Load tokenizer and model from volume cache
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        cache_dir=cache_dir,
        local_files_only=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        cache_dir=cache_dir,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        local_files_only=True,
    )

    # Apply chat template
    input_text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=True,
            temperature=temperature,
            top_p=0.9,
        )

    # Decode only the new tokens
    generated = outputs[0][inputs["input_ids"].shape[-1]:]
    response = tokenizer.decode(generated, skip_special_tokens=True)

    return {"response": response.strip()}


@Endpoint(
    name="flash-llama-downloader",
    gpu=GpuType.NVIDIA_GEFORCE_RTX_4090,
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
    """
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=f"{CACHE_DIR}/{MODEL_ID.split('/')[-1]}",
        token=os.getenv("HF_TOKEN"),
    )

    return {"status": "downloaded", "model": MODEL_ID, "path": CACHE_DIR}
