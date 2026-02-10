from flask import Flask, render_template, request, jsonify
import mediapipe as mp
import cv2
import numpy as np
import base64
import joblib
from ml.preprocessing.landmarks_extractor import normalize_landmarks

# Supported Ukrainian sign language letters (static gestures only)

SUPPORTED_LETTERS = [
    "А", "Б", "В", "Г", "Е", "Ж",
    "И", "І", "Л", "М", "Н", "О",
    "П", "Р", "С", "Т", "У", "Ф",
    "Х", "Ч", "Ш", "Ю", "Я"
]

clf = joblib.load("ml/models/usl_classifier.joblib")
classes = list(clf.classes_)
MIN_CONF = 0.60

# For convenience
NUM_CLASSES = len(SUPPORTED_LETTERS)

app = Flask(__name__)

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="model/hand_landmarker.task"),
    running_mode=VisionRunningMode.IMAGE
)

landmarker = HandLandmarker.create_from_options(options)

@app.route("/")
def index():
    return render_template("home.html")

@app.route("/learn")
def learn():
    return render_template("learn.html")

@app.route("/practice")
def practice():
    return render_template("practice.html")

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/hand-tracking")
def hand_tracking():
    return render_template("hand-tracking.html")

@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True)
    if not payload or "image" not in payload:
        return jsonify({"error": "Missing 'image'"}), 400

    data_url = payload["image"]

    # Decode base64
    try:
        image_bytes = base64.b64decode(data_url.split(",")[1])
    except Exception:
        return jsonify({"error": "Invalid base64 image"}), 400

    np_arr = np.frombuffer(image_bytes, np.uint8)
    if np_arr.size == 0:
        return jsonify({"error": "Empty image buffer"}), 400

    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "cv2.imdecode failed"}), 400

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = landmarker.detect(mp_image)

    # If no hand detected
    if not result.hand_landmarks:
        return jsonify({
            "has_hand": False,
            "pred": None,
            "prob": 0.0,
            "hands": []
        })

    # Take first hand
    hand = result.hand_landmarks[0]
    xyz = np.array([[lm.x, lm.y, lm.z] for lm in hand], dtype=np.float32)

    feats = normalize_landmarks(xyz)  # (63,)

    proba = clf.predict_proba([feats])[0]
    idx = int(np.argmax(proba))
    pred_label = str(classes[idx])
    pred_prob = float(proba[idx])

    pred_out = pred_label if pred_prob >= MIN_CONF else "Unknown"

    # keep landmarks if you need them in frontend
    hands = [[{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand]]

    return jsonify({
        "has_hand": True,
        "pred": pred_out,
        "prob": pred_prob,
        "hands": hands
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
