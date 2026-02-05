import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np
import joblib
from PIL import Image, ImageDraw, ImageFont

from ml.preprocessing.landmarks_extractor import normalize_landmarks


# =========================
# CONFIG
# =========================
MODEL_PATH = "ml/models/usl_classifier.joblib"
LANDMARKER_PATH = "model/hand_landmarker.task"

WINDOW = "USL Camera"

MIN_CONF_PRED = 0.60      # якщо менше — Pred показує "Unknown"
MIN_CONF_STABLE = 0.70    # якщо менше — не додаємо у стабілізатор
STABLE_N = 15             # довше вікно = менше "стрибає"

FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


# =========================
# FONT + DRAW
# =========================
def load_font(size: int):
    for p in FONT_PATHS:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


FONT_MED = load_font(44)


def draw_label_box(bgr_frame, text, xy, font, padding=10):
    """
    Білий прямокутник + чорний Unicode текст
    """
    rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(img_pil)

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x, y = xy
    rect = [x, y, x + text_w + padding * 2, y + text_h + padding * 2]

    draw.rectangle(rect, fill=(255, 255, 255))
    draw.text((x + padding, y + padding), text, font=font, fill=(0, 0, 0))

    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)


# =========================
# LOAD MODEL
# =========================
clf = joblib.load(MODEL_PATH)
classes = list(clf.classes_)


# =========================
# MEDIAPIPE SETUP (VIDEO)
# =========================
BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=LANDMARKER_PATH),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1
)


# =========================
# STABILIZER (score by probability)
# =========================
# зберігаємо останні N векторів ймовірностей
proba_queue = deque(maxlen=STABLE_N)

def stable_from_probas(queue):
    if len(queue) < max(5, STABLE_N // 2):
        return None, 0.0
    # сумуємо ймовірності по класах
    s = np.sum(np.array(queue), axis=0)
    idx = int(np.argmax(s))
    # "наскільки домінує" клас у вікні
    dominance = float(s[idx] / np.sum(s))
    return classes[idx], dominance


# =========================
# CAMERA
# =========================
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1080)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

cv2.namedWindow(WINDOW)


with HandLandmarker.create_from_options(options) as landmarker:
    while True:
        success, frame = cap.read()
        if not success:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        timestamp_ms = int(time.time() * 1000)
        result = landmarker.detect_for_video(mp_image, timestamp_ms)

        pred_label = None
        pred_prob = 0.0

        # ==============
        # PREDICT
        # ==============
        if result.hand_landmarks:
            hand = result.hand_landmarks[0]
            xyz = np.array([[lm.x, lm.y, lm.z] for lm in hand], dtype=np.float32)
            feats = normalize_landmarks(xyz)

            proba = clf.predict_proba([feats])[0]
            idx = int(np.argmax(proba))
            pred_label = str(classes[idx])
            pred_prob = float(proba[idx])

            # додаємо в стабілізатор тільки якщо впевненість нормальна
            if pred_prob >= MIN_CONF_STABLE:
                proba_queue.append(proba)
            else:
                if len(proba_queue) > 0:
                    proba_queue.popleft()
        else:
            if len(proba_queue) > 0:
                proba_queue.popleft()

        stable_label, stable_dom = stable_from_probas(proba_queue)

        # ==============
        # DISPLAY TEXT
        # ==============
        pred_display = "Unknown" if (pred_label is None or pred_prob < MIN_CONF_PRED) else pred_label
        pred_text = f"Pred: {pred_display} ({pred_prob:.2f})" if pred_label else "Pred: -"

        stable_text = "Stable: -" if stable_label is None else f"Stable: {stable_label} ({stable_dom:.2f})"

        overlay = frame.copy()
        overlay = draw_label_box(overlay, pred_text, (20, 20), FONT_MED)
        overlay = draw_label_box(overlay, stable_text, (20, 100), FONT_MED)
        overlay = draw_label_box(overlay, "ESC to exit", (20, 180), FONT_MED)

        cv2.imshow(WINDOW, overlay)

        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC
            break
        if cv2.getWindowProperty(WINDOW, cv2.WND_PROP_VISIBLE) < 1:
            break

cap.release()
cv2.destroyAllWindows()
