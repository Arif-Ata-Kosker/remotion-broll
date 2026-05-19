#!/usr/bin/env python3
"""
Face detection using MediaPipe Face Detection.
Outputs JSON with normalized bounding box to stdout.
Usage: python detect_face.py <image_path>
"""

import sys
import json
import cv2
import mediapipe as mp


def detect_face(image_path: str) -> dict:
    mp_face = mp.solutions.face_detection

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    h, w, _ = image.shape

    with mp_face.FaceDetection(
        model_selection=1,  # full-range model (better for farther faces)
        min_detection_confidence=0.5,
    ) as face_detection:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_detection.process(rgb)

        if not results.detections:
            # Fallback: assume person is centered, slightly above middle
            return {
                "faceBoundingBox": {
                    "x": 0.3,
                    "y": 0.15,
                    "width": 0.4,
                    "height": 0.35,
                },
                "faceCenter": {"x": 0.5, "y": 0.325},
                "sourceWidth": w,
                "sourceHeight": h,
                "confidence": 0.0,
            }

        # Take highest-confidence detection
        best = max(results.detections, key=lambda d: d.score[0])
        bb = best.location_data.relative_bounding_box

        face_center_x = bb.xmin + bb.width / 2
        face_center_y = bb.ymin + bb.height / 2

        return {
            "faceBoundingBox": {
                "x": float(bb.xmin),
                "y": float(bb.ymin),
                "width": float(bb.width),
                "height": float(bb.height),
            },
            "faceCenter": {
                "x": float(face_center_x),
                "y": float(face_center_y),
            },
            "sourceWidth": w,
            "sourceHeight": h,
            "confidence": float(best.score[0]),
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: detect_face.py <image_path>"}))
        sys.exit(1)

    try:
        result = detect_face(sys.argv[1])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
