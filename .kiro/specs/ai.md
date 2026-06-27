# AI Specifications
- **Objective**: Track cat behavior patterns in media files.
- **Design**: OpenCV frame extractor + YOLO bounding box parser.
- **Implementation**: Service inside `services/ai_pipeline.py`.
- **Risks**: Native compiling failure for C libraries on different macOS chip architectures. Fixed via CV contour area search fallback.
