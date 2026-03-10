{
const fly = document.getElementById("fly");
const frog = document.getElementById("frog");
const result = document.getElementById("result");
const gameArea = document.getElementById("game-area");
const cameraBtn = document.getElementById("cameraButtonG");
const title = document.querySelector(".instruction-game");
const fliesEatenText = document.querySelector(".flies-eaten-text");
const cameraZone = document.getElementById("cameraZoneG");
const modal = document.getElementById("gameModal");
const modalText = document.getElementById("modalText");
const modalTextPlus = document.getElementById("modalTextPlus");
const modalButton = document.getElementById("modalButton");
const foods = document.querySelectorAll(".lives-bar .food");
const modalFrog = document.getElementById("modalFrog");
const foodBar2 = document.querySelectorAll("#foodBar2 .food2");

const SUPPORTED_LETTERS = [
        "А", "Б", "В", "Г", "Е", "Ж",
        "И", "І", "Л", "М", "Н", "О",
        "П", "Р", "С", "Т", "У", "Ф",
        "Ч", "Ш", "Ю", "Я"
];


let flyInterval = null;

let counter = 0;
let loseCounter = 0;

let flyX = 0;
let flyY = 0;

let deltaX = 0;
let deltaY = 3;

const areaWidth = gameArea.clientWidth;
const areaHeight = gameArea.clientHeight;

const flyWidth = fly.clientWidth;
const flyHeight = fly.clientHeight;

function successAnimation(){
    foodBar2.forEach((food, index) => {
        food.classList.remove("food-no", "food-fall");
        if(index < loseCounter){
            food.classList.add("food-no");
        }
    });

    modal.style.display = "flex";
    modalText.textContent = "Ням, ням, ням!";
    modalTextPlus.style.visibility = "hidden";

    const frames = [
        "static/images/frog/4.png",
        "static/images/frog/1.png",
        "static/images/frog/3.png"
    ];
    let i = 0;
    const anim = setInterval(()=>{
        modalFrog.src = frames[i];
        i++;
        if(i >= frames.length){
            clearInterval(anim);
            setTimeout(()=>{
                modal.style.display = "none";
                modalFrog.src = "static/images/frog/4.png";
                frog.src = "static/images/frog/5.png";
                nextFly();
            },400);
        }
    },800);
}

function failAnimation(){
    foodBar2.forEach((food, index) => {
        food.classList.remove("food-no", "food-fall");
        if(index < loseCounter-1){
            food.classList.add("food-no");
        }
        else if(index === loseCounter-1){
            food.classList.add("food-fall");
        }
    });

    if(loseCounter>=5){
        modalText.textContent = `Гру закінчено!`;
        switch(counter){
            case 0:
                modalTextPlus.textContent = `Ваш результат: ${counter} мух-літер зʼїдено`;
                break;
            case 1:
                modalTextPlus.textContent = `Ваш результат: ${counter} муха-літера зʼїдена`;
                break;
            case 2:
                modalTextPlus.textContent = `Ваш результат: ${counter} мухи-літери зʼїдено`;
                break;
            case 3:
                modalTextPlus.textContent = `Ваш результат: ${counter} мухи-літери зʼїдено`;
                break;
            case 4:
                modalTextPlus.textContent = `Ваш результат: ${counter} мухи-літери зʼїдено`;
                break;
            default:
                modalTextPlus.textContent = `Ваш результат: ${counter} мух-літер зʼїдено`;
                break;

        }

        modalTextPlus.style.visibility = "visible";
        modalFrog.src = "static/images/frog/1.png";
        modalButton.style.visibility = "visible";
    } else{
        modalTextPlus.style.visibility = "hidden";
        modalText.textContent = "О ні...";
        modalFrog.src = "static/images/frog/sad.png";
        modalButton.style.visibility = "hidden";
    }

    modal.style.display = "flex";

    setTimeout(()=>{
        if(loseCounter<5){
            modalFrog.src = "static/images/frog/4.png";
            frog.src = "static/images/frog/5.png";
            fly.style.visibility = "hidden";
            modal.style.display = "none";
            modalTextPlus.style.visibility = "hidden";
            modalText.textContent = "О ні...";
            nextFly();
        }
    },1200);

}

window.gameSuccess = function(){
    clearInterval(flyInterval);
    clearInterval(handTrackingInterval);
    frog.src = `static/images/frog/2.png`;
    counter++;
    fliesEatenText.textContent = `Мух зʼїдено: `+counter;

    animateFlyToFrog(() => {
        fly.style.visibility = "hidden";
        successAnimation();
    });
}

window.gameFail = function(){
    clearInterval(flyInterval);
    clearInterval(handTrackingInterval);

    loseCounter++;
    updateLives();

    failAnimation();
}

function restartGame(){
    location.reload();
}

window.appState = {
    currentLetter: null
};

function moveFly()
{
    flyY += deltaY;
    if (flyY > areaHeight){
        fly.style.visibility = "hidden";
        gameFail();
        return;
    }
    fly.style.top = flyY + "px";
}

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
        //return "Б";
}

function animateFlyToFrog(callback){
    const frogRect = frog.getBoundingClientRect();
    const flyRect = fly.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    const frogCenterX = frogRect.left + frogRect.width/3 - gameRect.left;
    const frogCenterY = frogRect.top + frogRect.height/4 - gameRect.top;

    fly.style.left = frogCenterX + "px";
    fly.style.top = frogCenterY + "px";
    fly.style.transform = "scale(0)";
    setTimeout(callback, 400);
}

async function nextFly(){
    fly.style.visibility = "hidden";
    fly.style.transition = "none";
    const letter = getRandomLetter();
    window.appState.currentLetter = letter;
    if (window.startSendingFrames) {
        window.startSendingFrames();
    }
    await setFlyLetter(letter);
    const areaWidth = gameArea.clientWidth;
    const flyWidth = fly.clientWidth;
    flyX = Math.random() * (areaWidth - flyWidth);
    flyY = 0;
    requestAnimationFrame(() => {
        fly.style.left = flyX + "px";
        fly.style.top = flyY + "px";
        fly.style.transform = "scale(1)";
        requestAnimationFrame(() => {
            fly.style.transition = "left 0.4s linear, top 0.4s linear, transform 0.4s linear";
            fly.style.visibility = "visible";
            flyInterval = setInterval(moveFly, 80);
        });
    });
}

function updateLives(){
    foods.forEach((food, index) => {
        if(index < loseCounter){
            food.src = "static/images/food/lose.png";
            food.classList.remove("full");
            food.classList.add("lose");
        }
        else{
            food.src = "static/images/food/win.png";
            food.classList.remove("lose");
            food.classList.add("full");
        }
    });
}

cameraBtn.addEventListener("click", () => {
        cameraBtn.remove();
        nextFly();
        fly.style.visibility = "visible";
        title.style.visibility = "visible";
        fliesEatenText.style.visibility = "visible";
        frog.src = `static/images/frog/5.png`;
        counter = 0;
        loseCounter = 0;
        updateLives();

        cameraZone.insertAdjacentHTML("beforeend", `
            <video id="video" class="camera-rectangle" autoplay playsinline></video>
            <canvas id="canvas" style="display:none;"></canvas>
        `);

        const script = document.createElement("script");
        script.src = "static/hand-tracking-script-game.js";
        script.defer = true;
        document.body.appendChild(script);
});

}