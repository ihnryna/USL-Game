window.appState = {
    currentLetter: null
};

{
const cameraBtn = document.getElementById("cameraButtonPr");
const checkBtn = document.getElementById("checkButtonPr");
const nextLetterButton = document.getElementById("nextLetterButtonPr");
const cameraZone = document.getElementById("cameraZonePr");
const cameraFrame = document.getElementById("userGestureCardPr");
const resultText = document.getElementById("resultTextPr");

const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Х", "Ч", "Ш", "Ю", "Я"
];

cameraBtn.addEventListener("click", () => {
        cameraBtn.remove();
        checkBtn.style.visibility = "visible";

        cameraZone.insertAdjacentHTML("beforeend", `
            <video id="video" class="camera-rectangle" autoplay playsinline></video>
            <canvas id="canvas" style="display:none;"></canvas>
        `);

        const script = document.createElement("script");
        script.src = "static/hand-tracking-script-practice.js";
        script.defer = true;
        document.body.appendChild(script);
});

nextLetterButton.addEventListener("click", () => {
    nextLetter();
    resultText.style.visibility = "hidden";
    cameraFrame.classList.add("state-neutral");
    checkBtn.style.visibility = "visible";
    checkBtn.textContent = "Перевірити";
    nextLetterButton.disabled=true;
});


function getRandomLetter() {
        const index = Math.floor(Math.random() * SUPPORTED_LETTERS.length);
        return SUPPORTED_LETTERS[index];
        //return "О";
}

function setLetter(l) {
        const letter = document.querySelector(".practice-letter");
        const title = document.querySelector(".instruction-practice");

        if (title) {
            title.textContent = `Покажіть жест для літери «${l}»`;
        }

        if (letter) {
            letter.textContent = `${l}`;
            letter.style.display = "block";
        }
}

function nextLetter(){
    const letter = getRandomLetter();
    setLetter(letter);
    nextLetterButton.disabled=true;
    window.appState.currentLetter = letter;

    const letterImg = document.getElementById("letterImg");
    if (letterImg) {
        letterImg.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    nextLetter();
});

}