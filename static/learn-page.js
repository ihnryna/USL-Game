const cameraBtn = document.getElementById("cameraButton");
const nextLetterButton = document.getElementById("nextLetterButton");
const cameraZone = document.getElementById("cameraZone");
const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Х", "Ч", "Ш", "Ю", "Я"
];

window.appState = {
    currentLetter: null
};


cameraBtn.addEventListener("click", () => {
        cameraBtn.remove();

        cameraZone.insertAdjacentHTML("beforeend", `
            <video id="video" class="camera-rectangle" autoplay playsinline></video>
            <canvas id="canvas" style="display:none;"></canvas>
        `);

        const script = document.createElement("script");
        script.src = "static/hand-tracking-script-learn.js";
        script.defer = true;
        document.body.appendChild(script);
});

nextLetterButton.addEventListener("click", () => {
    nextLetter();
});


function getRandomLetter() {
        const index = Math.floor(Math.random() * SUPPORTED_LETTERS.length);
        return SUPPORTED_LETTERS[index];
        //return "О";
}

function setLetter(l) {
        const img = document.querySelector(".card-image img");
        const title = document.querySelector(".instruction-practice");

        img.src = `static/images/letter-cards/${l}.png`;
        img.alt = `Літера / Жест ${l}`;

        if (title) {
            title.textContent = `Покажіть жест для літери «${l}»`;
        }
}

function nextLetter(){
    const letter = getRandomLetter();
    window.appState.currentLetter = letter;
    if (window.startSendingFrames) {
        window.startSendingFrames();
    }
    nextLetterButton.disabled=true;
    setLetter(letter);
}

document.addEventListener("DOMContentLoaded", () => {
    nextLetter();
});