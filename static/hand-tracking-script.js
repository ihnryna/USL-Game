const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        startSendingFrames();
    });

function startSendingFrames() {
setInterval(async () => {
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
    console.log(data);
}, 1000);
}

