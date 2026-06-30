import os
import runpod
from paddleocr import PaddleOCR

# Force offline mode for HuggingFace models used by PaddleOCR
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

# PaddleOCR model cache location
PADDLE_CACHE_ROOT = "/runpod-volume/paddleocr-cache"

# Initialize PaddleOCR at startup
ocr = PaddleOCR(
    use_angle_cls=True,
    lang="en",
    show_log=False,
    model_dir=PADDLE_CACHE_ROOT if os.path.isdir(PADDLE_CACHE_ROOT) else None,
)

print("[ModelStore] PaddleOCR model loaded")


def handler(job):
    """
    Handler function for OCR (text extraction) requests.

    Args:
        job: Runpod job object containing input data

    Returns:
        Dictionary with extracted text or error information
    """
    job_input = job.get("input", {}) or {}
    image_base64 = job_input.get("image", "")
    language = job_input.get("language", "en")

    print(f"[Handler] Processing OCR request, language: {language}")

    try:
        import tempfile
        import base64

        # Decode base64 image to temporary file
        image_bytes = base64.b64decode(image_base64)
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        # Run OCR
        result = ocr.ocr(tmp_path, cls=True)

        # Clean up temp file
        os.unlink(tmp_path)

        # Parse results
        extracted_text = []
        regions = []
        for line in result:
            if line:
                for word_info in line:
                    bbox = word_info[0]
                    text = word_info[1][0]
                    confidence = word_info[1][1]

                    extracted_text.append(text)
                    regions.append({
                        "text": text,
                        "confidence": confidence,
                        "bbox": bbox,
                    })

        full_text = " ".join(extracted_text)
        print(f"[Handler] Extracted {len(regions)} text regions, {len(full_text)} chars")

        return {
            "status": "success",
            "text": full_text,
            "regions": regions,
            "region_count": len(regions),
        }

    except Exception as e:
        print(f"[Handler] Error during OCR: {e}")
        return {
            "status": "error",
            "error": str(e),
        }


runpod.serverless.start({"handler": handler})
