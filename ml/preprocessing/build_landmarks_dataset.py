from pathlib import Path
import csv
import cv2
from ml.preprocessing.landmarks_extractor import create_detector, extract_features


SUPPORTED = [
    "А","Б","В","Г","Е","Ж",
    "И","І","Л","М","Н","О",
    "П","Р","С","Т","У","Ф",
    "Х","Ч","Ш","Ю","Я"
]


def project_root():
    return Path(__file__).resolve().parents[2]


def main():

    root = project_root()

    data_dir = root / "data/raw/usl_200x200/USL_alphabet_train"
    out_csv = root / "data/processed/usl_landmarks.csv"
    fail_csv = root / "data/processed/usl_failed.csv"

    detector = create_detector()

    with open(out_csv, "w", newline="", encoding="utf-8") as f_out, \
         open(fail_csv, "w", newline="", encoding="utf-8") as f_fail:

        writer = csv.writer(f_out)
        fail_writer = csv.writer(f_fail)

        header = ["label"] + [f"f{i}" for i in range(63)]
        writer.writerow(header)
        fail_writer.writerow(["label","path"])

        for letter in SUPPORTED:

            letter_dir = data_dir / letter

            if not letter_dir.exists():
                continue

            for img_path in letter_dir.glob("*"):

                img = cv2.imread(str(img_path))

                if img is None:
                    fail_writer.writerow([letter, str(img_path)])
                    continue

                features = extract_features(detector, img)

                if features is None:
                    fail_writer.writerow([letter, str(img_path)])
                    continue

                writer.writerow([letter] + features.tolist())

    print("DONE")


if __name__ == "__main__":
    main()
