from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib


def project_root():
    return Path(__file__).resolve().parents[2]


def main():
    root = project_root()

    df = pd.read_csv(root / "data/processed/usl_landmarks.csv")

    X = df.drop(columns=["label"]).values
    y = df["label"].values

    X_train, X_val, y_train, y_val = train_test_split(
        X, y,
        test_size=0.2,
        stratify=y,
        random_state=42
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000))
    ])

    model.fit(X_train, y_train)

    preds = model.predict(X_val)

    print("Accuracy:", accuracy_score(y_val, preds))
    print(classification_report(y_val, preds))

    joblib.dump(model, root / "ml/models/usl_classifier.joblib")

    print("Model saved")


if __name__ == "__main__":
    main()
