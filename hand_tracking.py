import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

window = "Camera"
cv2.namedWindow(window)

while True:
    success, frame = cap.read()
    if not success:
        break

    cv2.imshow(window, frame)
    cv2.waitKey(1)

    if cv2.getWindowProperty(window, cv2.WND_PROP_VISIBLE) < 1:
        break

cap.release()
cv2.destroyAllWindows()