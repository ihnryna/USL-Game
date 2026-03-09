{
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cameraFrame = document.getElementById("userGestureCardG");

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

    }, 1000);
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
    showResult((rightLetters>=2), intervalId);
}

function showResult(win, intervalId){

    if(win){
        /*resultText.textContent = "Руку не знайдено";
        resultText.style.visibility = "visible";
        cameraFrame.classList.add("state-wrong");
        return;*/
    }else{
    }
}

}