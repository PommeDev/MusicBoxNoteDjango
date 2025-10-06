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

document.addEventListener("DOMContentLoaded", function() {

    const img = document.getElementById('cover-image');
    const container = document.getElementById("audio-section");
    const audioEl = document.getElementById("my-audio");
    const button = document.getElementById("button-play");
    const iconPlay2 = document.getElementById("icon-play");
    const iconPause2 = document.getElementById("icon-pause");

    let compColor = "rgb(255,255,255)"; // valeur par défaut
    let audioCtx, analyser, dataArray, sourceNode;
    let is_sticky = true;

    // 1️⃣ Fonction : calcul couleur moyenne + complémentaire
    function getAverageColor(imgElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = imgElement.naturalWidth || imgElement.width;
        const h = imgElement.naturalHeight || imgElement.height;
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(imgElement, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r=0,g=0,b=0,count=0;
        for (let i=0; i<data.length; i+=4) {
            r+=data[i]; g+=data[i+1]; b+=data[i+2]; count++;
        }
        return {r:Math.round(r/count), g:Math.round(g/count), b:Math.round(b/count)};
    }

    function getComplementaryColor({r,g,b}) {
        return {r:255-r, g:255-g, b:255-b};
    }

    // 2️⃣ Initialisation audio et effets (à lancer APRÈS avoir compColor)
    function initAudioEffects(mainColor) {
        const rootStyles = getComputedStyle(document.documentElement);
        const secondary = rootStyles.getPropertyValue('--halo-secondary').trim();
        const light = rootStyles.getPropertyValue('--halo-light').trim();

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
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                sourceNode = audioCtx.createMediaElementSource(audioEl);
                sourceNode.connect(analyser);
                analyser.connect(audioCtx.destination);
            }

            await audioCtx.resume();

            if (audioEl.paused) {
                try { 
                    await audioEl.play();
                    iconPlay2.style.display = "none";
                    iconPause2.style.display = "inline";
                }
                catch(e) { 
                    console.error("Erreur play:", e); }
            } 
            else { 
                audioEl.pause(); 
                iconPlay2.style.display = 'inline';
                iconPause2.style.display = 'none';
            }
        });

        audioEl.addEventListener("ended", () => {
            iconPlay2.style.display = "inline";
            iconPause2.style.display = "none";
        });

        function updateBorder() {

            if (!is_sticky) {
                container.style.boxShadow = "none";
                requestAnimationFrame(updateBorder);
                return;
            }

            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                let level = dataArray.reduce((a,b) => a+b, 0) / dataArray.length;
                level /= 25;
                level = Math.max(level, 0.3);
                let intensity = Math.max(level * 30, 10);
                container.style.boxShadow = `
                    0 0 ${intensity}px ${mainColor},
                    0 0 ${intensity*0.7}px ${secondary},
                    0 0 ${intensity*1.2}px ${light}
                `;
            }
            requestAnimationFrame(updateBorder);
        }

        updateBorder();
    }

    // 3️⃣ Attendre le chargement de l'image
img.addEventListener('load', function() {
    const avg = getAverageColor(img);
    const palette = generatePaletteFromAverage(avg);

    // Applique les couleurs au CSS
    document.documentElement.style.setProperty('--halo-main', palette.main);
    document.documentElement.style.setProperty('--halo-light', palette.light);
    document.documentElement.style.setProperty('--halo-secondary', palette.halo);

    console.log("🎨 Palette:", palette);

    initAudioEffects(palette.main);
});



    // au cas où l'image serait déjà en cache (donc "load" non déclenché)
    if (img.complete) {
        img.dispatchEvent(new Event('load'));
    }


    const player = document.getElementById("sticky-player");
    const triggerPoint = player.offsetTop + 150; // moment où le lecteur devient fixe

    window.addEventListener("scroll", function() {
        if (window.scrollY > triggerPoint) {
            is_sticky = false;
            player.classList.add("fixed");
            player.classList.remove("static");
        } else {
            player.classList.remove("fixed");
            player.classList.add("static");
            is_sticky = true;
        }
    });



});


function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l };
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function generatePaletteFromAverage(avg) {
    const hsl = rgbToHsl(avg.r, avg.g, avg.b);

    // Couleur complémentaire (teinte opposée)
    const mainHsl = { ...hsl, h: (hsl.h + 0.5) % 1 };

    // Ajuster saturation & luminosité pour du contraste perceptible
    mainHsl.s = Math.min(mainHsl.s + 0.3, 1);
    if (mainHsl.l > 0.6) mainHsl.l = 0.4;
    else if (mainHsl.l < 0.4) mainHsl.l = 0.6;

    const lightHsl = { ...mainHsl, l: Math.min(mainHsl.l + 0.25, 1) };
    const haloHsl = { ...mainHsl, l: Math.max(mainHsl.l - 0.25, 0) };

    const main = hslToRgb(mainHsl.h, mainHsl.s, mainHsl.l);
    const light = hslToRgb(lightHsl.h, lightHsl.s, lightHsl.l);
    const halo = hslToRgb(haloHsl.h, haloHsl.s, haloHsl.l);

    return {
        main: `rgb(${main.r}, ${main.g}, ${main.b})`,
        light: `rgb(${light.r}, ${light.g}, ${light.b})`,
        halo: `rgb(${halo.r}, ${halo.g}, ${halo.b})`
    };
}
