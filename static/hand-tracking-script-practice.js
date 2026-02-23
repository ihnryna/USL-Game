{
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const nextLetterButton = document.getElementById("nextLetterButtonPr");
const cameraFrame = document.getElementById("userGestureCardPr");
const resultText = document.getElementById("resultTextPr");
const checkBtn = document.getElementById("checkButtonPr");


navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    });

let results = [];

checkBtn.addEventListener("click", async () => {
    if(checkBtn.textContent=="Перевірити"){
    canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0); // draw current frame from video on invisible buffer element (canvas)

        const imageData = canvas.toDataURL("image/jpeg");

        const res = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData })
        });

        const data = await res.json();

        if(data.has_hand){
            results.push(data.pred);
        } else {
            results.push(0);
        }

        console.log("Results:", results);
        showResult(results);
    }
    else {
        resultText.style.visibility = "hidden";
        cameraFrame.classList.add("state-neutral");
        checkBtn.style.visibility = "visible";
        checkBtn.textContent = "Перевірити";
        nextLetterButton.disabled=true;
    }
});

function showResult(result) {
    const currentLetter = window.appState?.currentLetter;
    console.log("CUrr: "+currentLetter);

    cameraFrame.classList.remove("state-correct", "state-wrong", "state-neutral");

    if(result.length==1){
        if(result[0]==currentLetter){
            console.log(1);
            resultText.textContent = "Чудово! Ви добре запамʼятали цей жест";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-correct");
            checkBtn.style.visibility = "hidden";
            checkBtn.textContent = "Перевірити";
            nextLetterButton.disabled=false;
            results = [];
        } else {
            console.log(2);
            resultText.textContent = "Це не зовсім так, спробуйте ще раз";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-wrong");
            checkBtn.style.visibility = "visible";
            checkBtn.textContent = "Спробувати знову";
            nextLetterButton.disabled=true;
        }
        return;
    }
    if(result.length==2){
        if(result[1]==currentLetter){
            console.log(3);
            resultText.textContent = "Чудово! Ви добре запамʼятали цей жест";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-correct");
            checkBtn.style.visibility = "hidden";
            checkBtn.textContent = "Перевірити";
            nextLetterButton.disabled=false;
            results = [];
        } else {
        console.log(4);
            resultText.textContent = "Ви використали 2/2 спроб, перегляньте і відтворіть правильний жест";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-wrong");
            checkBtn.style.visibility = "visible";
            checkBtn.textContent = "Спробувати знову";
            nextLetterButton.disabled=true;

            const letter = document.querySelector(".practice-letter");
            if (letter) {
                letter.style.display = "none";
            }
            const letterImg = document.getElementById("letterImg");
            if (letterImg) {
                letterImg.src = `static/images/letter-cards/${currentLetter}.png`;
                letterImg.style.display = "block";
            }
        }
        return;
    }
    if(result.length>2){
        if(result[result.length-1]==currentLetter){
        console.log(5);
            resultText.textContent = "Чудово! Переходимо далі";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-correct");
            checkBtn.style.visibility = "hidden";
            checkBtn.textContent = "Перевірити";
            nextLetterButton.disabled=false;
            results = [];
        } else {
        console.log(6);
            resultText.textContent = "Перегляньте і відтворіть правильний жест";
            resultText.style.visibility = "visible";
            cameraFrame.classList.add("state-wrong");
            checkBtn.style.visibility = "visible";
            checkBtn.textContent = "Спробувати знову";
            nextLetterButton.disabled=true;

            const letter = document.querySelector(".practice-letter");
            if (letter) {
                letter.style.display = "none";
            }
            const letterImg = document.getElementById("letterImg");
            if (letterImg) {
                letterImg.src = `static/images/letter-cards/${currentLetter}.png`;
                letterImg.style.display = "block";
            }
        }
        return;
    }
}

}