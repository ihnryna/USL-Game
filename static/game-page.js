const fly = document.getElementById("fly");
const frog = document.getElementById("frog");
const button = document.getElementById("catchBtn");
const result = document.getElementById("result");

let flyX = 0;
let flyY = 0;

let deltaX = 0;
let deltaY = 0;

const areaWidth = 560;
const areaHeight = 360;

function changeDirectionFly()
{
    deltaX = (Math.random()-0.5) * 10;
    deltaY = (Math.random()-0.5) * 10;
}
setInterval(changeDirectionFly, 1000);

function moveFly()
{
    flyX += deltaX;
    flyY += deltaY;

    if (flyX < 0 || flyX > areaWidth)
        deltaX *= -1;

    if (flyY < 0 || flyY > areaHeight)
        deltaY *= -1;

    fly.style.left = flyX + "px";
    fly.style.top = flyY + "px";
}
setInterval(moveFly, 16);

button.onclick = function()
{
    const frogRect = frog.getBoundingClientRect();
    const flyRect = fly.getBoundingClientRect();

    const frogCenterX = frogRect.left + frogRect.width/2;
    const frogCenterY = frogRect.top + frogRect.height/2;

    const flyCenterX = flyRect.left + flyRect.width/2;
    const flyCenterY = flyRect.top + flyRect.height/2;

    const distance = Math.sqrt(
        (frogCenterX - flyCenterX) ** 2 +
        (frogCenterY - flyCenterY) ** 2
    );

    if(distance < 120)
    {
        result.innerText = "🐸 Got it!";
        moveFly();
    }
    else
    {
        result.innerText = "Missed!";
    }
}