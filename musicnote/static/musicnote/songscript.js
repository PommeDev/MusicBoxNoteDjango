window.addEventListener("load", () => {
    const img = document.getElementById("cover-image");
    const background = document.getElementById("background-container");

    if (img.complete) {
        setBackground();
    } else {
        img.onload = setBackground;
    }

    function setBackground() {
        // 1️⃣ couleur dominante
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        let r=0, g=0, b=0, count=0;
        for(let i=0; i<data.length; i+=4){
            const alpha = data[i+3];
            if(alpha<128) continue;
            const brightness = (data[i]+data[i+1]+data[i+2])/3;
            if(brightness<30 || brightness>220) continue;
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        r = Math.floor(r/count);
        g = Math.floor(g/count);
        b = Math.floor(b/count);

        // 2️⃣ image floutée en background
        background.style.backgroundImage = `url(${img.src})`;

        // 3️⃣ overlay semi-transparent
        let overlay = document.getElementById("background-overlay");
        if(!overlay){
            overlay = document.createElement("div");
            overlay.id = "background-overlay";
            document.body.appendChild(overlay);
        }
        overlay.style.backgroundColor = `rgba(${r},${g},${b},0.35)`;
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("audio-section");
    const audioEl = document.getElementById("my-audio");
    const button = document.getElementById("button-play");
    const iconPlay2 = document.getElementById("icon-play");
    const iconPause2 = document.getElementById("icon-pause");





    let audioCtx, analyser, dataArray, sourceNode;

    function setupAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        sourceNode = audioCtx.createMediaElementSource(audioEl);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    button.addEventListener("click", async () => {
        setupAudio();
        await audioCtx.resume();
        if (audioEl.paused) {
            try {
                await audioEl.play();
                iconPlay2.style.display = "none";
                iconPause2.style.display = "inline";
            } catch(e) {
                console.error("Erreur play:", e);
            }
        } else {
            audioEl.pause();
            iconPlay2.style.display = "inline";
            iconPause2.style.display = "none";
        }
    });


    audioEl.addEventListener("ended", () => {
        iconPlay2.style.display = "inline";
        iconPause2.style.display = "none";
    });

    

    const rootStyles = getComputedStyle(document.documentElement);
    const main = rootStyles.getPropertyValue('--halo-main').trim();
    const secondary = rootStyles.getPropertyValue('--halo-secondary').trim();
    const light = rootStyles.getPropertyValue('--halo-light').trim();


    function updateBorder() {
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            let level = dataArray.reduce((a,b) => a+b, 0) / dataArray.length;
            level /= 25;
            level = Math.max(level, 0.3);
            let intensity = Math.max(level * 30, 10);
            container.style.boxShadow = `
                0 0 ${intensity}px ${main},
                0 0 ${intensity*0.7}px ${secondary},
                0 0 ${intensity*1.2}px ${light}
            `;

        }
        requestAnimationFrame(updateBorder);
    }

    updateBorder();
});
