# USL Game 🎮✋

Веб-сторінка для вивчення українського жестового алфавіту

---
### Технічні засоби
#### Датасет
● USL 200x200 image dataset <br/>
● MediaPipe landmarks extracted from images <br/>
● 63 normalized features per sample <br/>
#### Модель
● Logistic Regression <br/>
● Probability-based output <br/>
● Threshold filtering <br/>
#### Метрики
● Accuracy ~98–99% (validation) <br/>
● Weighted F1 ~0.99 <br/>
● Macro F1 lower due to minority classes <br/>
#### Архітектура
Camera → MediaPipe → Landmark normalization → ML model → Confidence filtering → Stabilization → UI feedback

---

### 🚀 Запуск проєкту

#### 1️⃣ Створити віртуальне середовище

```bash
python -m venv venv
```

Активувати:

- **Windows**
```bash
venv\Scripts\activate
```

- **Linux / macOS**
```bash
source venv/bin/activate
```

---

#### 2️⃣ Встановити залежності

```bash
pip install -r requirements.txt
```

---

#### 3️⃣ Запустити Flask

```bash
python app.py
```

або

```bash
flask run
```

Відкрити у браузері:
```
http://127.0.0.1:5000
```
