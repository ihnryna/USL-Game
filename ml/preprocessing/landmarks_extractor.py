from pathlib import Path
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


def project_root():
    return Path(__file__).resolve().parents[2]


def create_detector():
    root = project_root()

    possible_paths = [
        root / "ml/models/hand_landmarker.task",
        root / "model/hand_landmarker.task",
    ]

    model_path = None
    for p in possible_paths:
        if p.exists():
            model_path = p
            break

    if model_path is None:
        raise FileNotFoundError("hand_landmarker.task not found")

    base_options = python.BaseOptions(model_asset_path=str(model_path))
    options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
    return vision.HandLandmarker.create_from_options(options)


def normalize_landmarks(xyz: np.ndarray) -> np.ndarray:
    """
    xyz: (21,3) normalized landmarks from MediaPipe
    -> centered at wrist (0), scaled by wrist->middle_mcp (9), flattened (63,)
    IMPORTANT: must be identical for dataset + webcam inference.
    """
    xyz = xyz.astype(np.float32)

    wrist = xyz[0].copy()
    centered = xyz - wrist

    scale = np.linalg.norm(centered[9])  # wrist -> middle_mcp
    if scale < 1e-6:
        scale = 1.0

    normalized = centered / scale
    return normalized.reshape(-1)  # (63,)


def extract_features(detector, bgr_image):
    rgb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = detector.detect(mp_image)
    if not result.hand_landmarks:
        return None

    landmarks = result.hand_landmarks[0]
    xyz = np.array([[lm.x, lm.y, lm.z] for lm in landmarks], dtype=np.float32)

    return normalize_landmarks(xyz)
