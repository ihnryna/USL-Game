from flask import Flask, render_template, request, jsonify
import mediapipe as mp
import cv2
import numpy as np
import base64

# Supported Ukrainian sign language letters (static gestures only)

SUPPORTED_LETTERS = [
    "А", "Б", "В", "Г", "Е", "Ж",
    "И", "І", "Л", "М", "Н", "О",
    "П", "Р", "С", "Т", "У", "Ф",
    "Х", "Ч", "Ш", "Ю", "Я"
]

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

@app.route("/recall")
def recall():
    return render_template("recall.html")

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/hand-tracking")
def hand_tracking():
    return render_template("hand-tracking.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["image"]

    image_bytes = base64.b64decode(data.split(",")[1]) # get rid of "data:image/jpeg;base64,"

    np_arr = np.frombuffer(image_bytes, np.uint8)
    if np_arr.size == 0:
        return jsonify({"error": "Empty image buffer"}), 400
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb
    )

    result = landmarker.detect(mp_image)

    hands = []
    for hand in result.hand_landmarks:
        hands.append([
            {"x": lm.x, "y": lm.y, "z": lm.z}
            for lm in hand
        ])

    return jsonify({"hands": hands})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
