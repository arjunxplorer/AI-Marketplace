#!/bin/bash
# Deploy all Flash endpoints to RunPod
# Run from the project root directory

set -e

echo "========================================="
echo "  RunPod Flash Deployment Script"
echo "========================================="
echo ""

# Check if flash CLI is installed
if ! command -v flash &> /dev/null; then
    echo "Error: flash CLI not found. Install with: pip install runpod-flash"
    exit 1
fi

# Check if flash CLI works
echo "Checking Flash CLI..."
flash --version || { echo "Flash CLI not working. Install with: pip install runpod-flash"; exit 1; }

# Check for API key
if [ -z "$RUNPOD_API_KEY" ]; then
    echo "Warning: RUNPOD_API_KEY not set. Run 'flash login' to authenticate."
fi

echo ""
echo "Deploy order (recommended):"
echo "  1. Llama (simplest text endpoint)"
echo "  2. Whisper (audio processing)"
echo "  3. BGE (embeddings)"
echo "  4. FLUX (largest, most resources)"
echo ""

# Function to deploy a Flash app
deploy_flash() {
    local dir=$1
    local name=$2

    echo "-----------------------------------------"
    echo "Deploying: $name"
    echo "Directory: $dir"
    echo "-----------------------------------------"

    cd "$dir"

    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv .venv
    fi

    # Activate and install dependencies
    source .venv/bin/activate
    pip install -q -r requirements.txt

    # Deploy
    echo "Deploying to RunPod..."
    flash deploy

    deactivate
    cd ..

    echo ""
    echo "✓ $name deployed successfully"
    echo ""
}

# Deploy each Flash app
echo "Starting deployments..."
echo ""

deploy_flash "flash-llama" "Llama 3.2"
deploy_flash "flash-whisper" "Whisper v3"
deploy_flash "flash-bge" "BGE Large"
deploy_flash "flash-flux" "FLUX.1-dev"

echo "========================================="
echo "  All deployments complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Run the download_model endpoints to populate volume caches"
echo "  2. Copy endpoint IDs to flash-marketplace/.env.local"
echo "  3. Run the frontend: cd flash-marketplace && npm run dev"
