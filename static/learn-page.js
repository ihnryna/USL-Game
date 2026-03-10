window.appState = {
    currentLetter: null
};

{

const cameraBtn = document.getElementById("cameraButton");
const nextLetterButton = document.getElementById("nextLetterButton");
const cameraZone = document.getElementById("cameraZone");
const cameraFrame = document.getElementById("userGestureCard");

const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Ч", "Ш", "Ю", "Я"
];

const supportBtn = document.getElementById("supportButton");
supportBtn.style.visibility = "visible";
const supportModal = document.getElementById("supportModal");
const screenshotContainer = document.getElementById("screenshotContainer");
const closeSupportBtn = document.getElementById("closeSupportBtn");
const sendSupportBtn = document.getElementById("sendSupportBtn");
const supportDescription = document.getElementById("supportDescription");

supportBtn.addEventListener("click", async () => {
    clearInterval(intervalId);
    const canvas = await html2canvas(document.body);
    const dataURL = canvas.toDataURL("image/png");
    screenshotContainer.innerHTML = `<img src="${dataURL}" alt="Скріншот"/>`;
    supportDescription.value = "";
    supportModal.style.display = "flex";
});

closeSupportBtn.addEventListener("click", () => {
    supportModal.style.display = "none";
    if (window.startSendingFrames) {
        window.startSendingFrames();
    }
});

sendSupportBtn.addEventListener("click", () => {
    supportModal.style.display = "none";
    const video = document.getElementById("video");
    nextLetter();
    resultText.style.visibility = "hidden";
    cameraFrame.classList.add("state-neutral");
    nextLetterButton.disabled=true;
});


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
    resultText.style.visibility = "hidden";
    setLetter(letter);
}

document.addEventListener("DOMContentLoaded", () => {
    nextLetter();
});

}