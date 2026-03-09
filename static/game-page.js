{
const fly = document.getElementById("fly");
const frog = document.getElementById("frog");
const result = document.getElementById("result");
const gameArea = document.getElementById("game-area");
const cameraBtn = document.getElementById("cameraButtonG");
const title = document.querySelector(".instruction-game");
const cameraZone = document.getElementById("cameraZoneG");
const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Х", "Ч", "Ш", "Ю", "Я"
];


window.appState = {
    currentLetter: null
};

let flyX = 0;
let flyY = 0;

let deltaX = 0;
let deltaY = 6;

const areaWidth = gameArea.clientWidth;
const areaHeight = gameArea.clientHeight;

const flyWidth = fly.clientWidth;
const flyHeight = fly.clientHeight;

/*function changeDirectionFly()
{
    deltaX = (Math.random()-0.5) * 10;
    deltaY = (Math.random()-0.5) * 10;
}
setInterval(changeDirectionFly, 1000);*/

function moveFly()
{
    flyY += deltaY;

    if (flyY < 0 || flyY+flyHeight > areaHeight){
        nextFly();
        return;
    }

    fly.style.top = flyY + "px";
}

cameraBtn.addEventListener("click", () => {
        cameraBtn.remove();
        nextFly();
        setInterval(moveFly, 80);
        fly.style.visibility = "visible";
        title.style.visibility = "visible";


        cameraZone.insertAdjacentHTML("beforeend", `
            <video id="video" class="camera-rectangle" autoplay playsinline></video>
            <canvas id="canvas" style="display:none;"></canvas>
        `);

        const script = document.createElement("script");
        script.src = "static/hand-tracking-script-game.js";
        script.defer = true;
        document.body.appendChild(script);
});

function setFlyLetter(l) {
    return new Promise((resolve) => {

        const src = `static/images/fly/${l}.png`;
        const img = new Image();

        img.onload = () => {
            fly.src = src;
            fly.alt = `Літера / Жест ${l}`;
            title.textContent = `Покажіть жест для літери «${l}»`;
            resolve();
        };

        img.src = src;
    });
}


function getRandomLetter() {
        const index = Math.floor(Math.random() * SUPPORTED_LETTERS.length);
        return SUPPORTED_LETTERS[index];
        //return "О";
}

async function nextFly(){

    const letter = getRandomLetter();
    window.appState.currentLetter = letter;

    if (window.startSendingFrames) {
        window.startSendingFrames();
    }

    await setFlyLetter(letter);   // ⬅ чекаємо поки картинка завантажиться

    const areaWidth = gameArea.clientWidth;
    const flyWidth = fly.clientWidth;

    flyX = Math.random() * (areaWidth - flyWidth);

    fly.style.left = flyX + "px";
    flyY = 0;
    fly.style.top = flyY + "px";
}

}