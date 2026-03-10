{
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cameraFrame = document.getElementById("userGestureCardG");

window.handTrackingInterval = null;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        startSendingFrames();
    });

window.startSendingFrames = function() {
    const resultsQueue = [];

    window.handTrackingInterval = setInterval(async () => {
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
        processLastResults(resultsQueue);

    }, 1000);
}

function processLastResults(results) {
    const currentLetter = window.appState?.currentLetter;

    var rightLetters = 0;
    results.forEach(letter => {
        if (letter==currentLetter) rightLetters++;
    });
    console.log(rightLetters);
    showResult((rightLetters>=2));
}

function showResult(win){
    if(win){
        clearInterval(handTrackingInterval);
        if(window.gameSuccess){
            window.gameSuccess();
        }
    }else{
    }
}

}