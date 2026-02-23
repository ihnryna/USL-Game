const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//const nextLetterButton = document.getElementById("nextLetterButton");
const cameraFrame = document.getElementById("userGestureCard");
const resultText = document.getElementById("resultText");


navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        startSendingFrames();
    });

window.startSendingFrames = function() {
    const resultsQueue = [];

    const intervalId = setInterval(async () => {
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
            resultsQueue.push(data.pred);
        } else {
            resultsQueue.push(0);
        }

        if (resultsQueue.length > 10) {
            resultsQueue.shift();
        }

        console.log("Queue:", resultsQueue);
        processLastResults(resultsQueue, intervalId);

    }, 200);
}

function processLastResults(results, intervalId) {
    const currentLetter = window.appState?.currentLetter;

    var rightLetters = 0;
    var noHand = 0;
    results.forEach(letter => {
        if (letter==currentLetter) rightLetters++;
        if (letter==0) noHand++;
    });
    console.log(rightLetters);
    showResult(rightLetters, noHand, intervalId);
}

function showResult(rightLetters, noHand, intervalId){

    cameraFrame.classList.remove("state-correct", "state-wrong", "state-neutral");

    if(noHand>5){
        resultText.textContent = "Руку не знайдено";
        cameraFrame.classList.add("state-wrong");
        return;
    }
    if(rightLetters==0){
        resultText.textContent = "Подивіться на приклад і спробуйте ще раз";
        cameraFrame.classList.add("state-wrong");
        return;
    }
    if(rightLetters<7){
        resultText.textContent = "Добре! Утримуйте жест... "+rightLetters+"/7";
        cameraFrame.classList.add("state-neutral");
        return;
    }
    if(rightLetters>=7){
        clearInterval(intervalId);
        resultText.textContent = "Чудово! Переходимо далі";
        cameraFrame.classList.add("state-correct");
        nextLetterButton.disabled=false;
        return;
    }
}