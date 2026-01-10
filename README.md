# Smart Pantry

AI-powered computer vision application to identify ingredients from images and suggest recipes.

## Table of contents
- About
- Features
- Quick start
- Usage examples
- Model & training
- Evaluation
- Privacy & security
- Contributing
- License

## About
Smart Pantry uses a computer vision model to detect common food ingredients from photos and returns ranked recipe suggestions based on detected items, dietary preferences, and available pantry items.

## Features
- Multi-label ingredient detection from a single image
- Recipe recommendation engine (matching, ranking, filters)
- Local inference or REST API mode
- Optional dietary, allergy, and cuisine filters
- Docker support for easy deployment

## Quick start (local)
Requirements: Python 3.8+, pip, optional CUDA for GPU.

1. Clone
    git clone https://github.com/your-org/smart-pantry.git
    cd smart-pantry

2. Install
    pip install -r requirements.txt

3. Download pretrained model (replace with actual URL)
    mkdir models && curl -L -o models/ingredient_detector.pth https://example.com/models/ingredient_detector.pth

4. Run demo server
    python app/server.py --model models/ingredient_detector.pth --port 8000

## Usage examples

- CLI inference
  python scripts/infer.py --image tests/images/salad.jpg --model models/ingredient_detector.pth

- Example JSON response (REST)
  POST /predict
  Input: multipart/form-data (image)
  Output:
  {
     "ingredients": [{"name":"tomato","score":0.98}, {"name":"basil","score":0.87}],
     "recipes": [
        {"title":"Tomato Basil Pasta","match_score":0.92, "url": "..."},
        {"title":"Bruschetta","match_score":0.80, "url": "..."}
     ]
  }

## Model & training
- Model: multi-label CNN (or transformer) with focal/BCELoss for class imbalance
- Dataset: combination of public food/ingredient datasets and in-house annotated images
- Training (example)
  python train.py --config configs/ingredient_detector.yaml --data data/train --epochs 30 --batch-size 32

Include validation and augmentation (random crops, color jitter, MixUp).

## Evaluation
- Metrics: mAP (multi-label), per-class precision/recall, recipe recommendation NDCG
- Test command:
  python evaluate.py --model models/ingredient_detector.pth --data data/val

## Privacy & security
- By default images are processed in-memory and not stored. If persistent storage is enabled, notify users and follow applicable privacy laws.
- Avoid sending sensitive images to third-party services.

## Contributing
1. Fork the repo
2. Create a feature branch
3. Add tests and update README where appropriate
4. Open a pull request with a clear description

## Files of interest
- app/ (REST server, web UI)
- models/ (pretrained weights)
- scripts/ (inference, dataset tools)
- train.py, evaluate.py, requirements.txt

## License
Specify project license in LICENSE file (e.g., MIT).

## Acknowledgements
Thank dataset contributors and open-source libraries used.
