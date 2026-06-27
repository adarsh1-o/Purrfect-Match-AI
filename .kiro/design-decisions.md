# Design Decisions

- **SQLite fallback**: Allows zero-config staging, avoiding compile blocks during hackathon evals.
- **Custom SVG radar charts**: Prevents hydration failures and keeps bundle weight under limit.
- **OpenCV Fallback**: Try-except imports for YOLO to run CV contours if native compilation fails.
