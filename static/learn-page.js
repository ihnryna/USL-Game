const cameraBtn = document.getElementById("cameraButton");
const nextLetterButton = document.getElementById("nextLetterButton");
const cameraZone = document.getElementById("cameraZone");
const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Х", "Ч", "Ш", "Ю", "Я"
];

cameraBtn.addEventListener("click", () => {
        cameraBtn.remove();

        cameraZone.insertAdjacentHTML("beforeend", `
            <video id="video" class="camera-rectangle" autoplay playsinline></video>
            <canvas id="canvas" style="display:none;"></canvas>
        `);

        const script = document.createElement("script");
        script.src = "static/hand-tracking-script.js";
        script.defer = true;
        document.body.appendChild(script);
});

nextLetterButton.addEventListener("click", () => {
    nextLetter();
});


function getRandomLetter() {
        const index = Math.floor(Math.random() * SUPPORTED_LETTERS.length);
        return SUPPORTED_LETTERS[index];
}

function setLetter(l) {
        const img = document.querySelector(".card-image img");
        const title = document.querySelector(".welcome h2");

        img.src = `static/images/letter-cards/${l}.png`;
        img.alt = `Літера / Жест ${l}`;

        if (title) {
            title.textContent = `Покажіть жест для літери «${l}»`;
        }
}

function nextLetter(){
    const letter = getRandomLetter();
    setLetter(letter);
}

document.addEventListener("DOMContentLoaded", () => {
    nextLetter();
});