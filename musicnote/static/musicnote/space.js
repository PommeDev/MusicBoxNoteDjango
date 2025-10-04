const canvas = document.getElementById('space-background');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const notes = [];
const NOTE_COUNT = 100;

// Charger l'image de note
const noteImg = new Image();
noteImg.src = '/static/musicnote/note.png'; // chemin vers ton image

// Générer les notes
for (let i = 0; i < NOTE_COUNT; i++) {
    notes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.2,
    });
}

const mouse = { x: null, y: null };

// Suivi de la souris
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function animate() {
    ctx.fillStyle = '#77b2b4ff';
    ctx.fillRect(0, 0, width, height);

    for (let note of notes) {
        // Interaction souris : repousser les notes proches
        if (mouse.x && mouse.y) {
            const dx = note.x - mouse.x;
            const dy = note.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                note.x += dx / dist * 2;
                note.y += dy / dist * 2;
            }
        }

        // Déplacement horizontal
        note.x += note.speed;
        if (note.x > width) note.x = 0;
        if (note.y > height) note.y = 0;

        // Dessiner l'image de note
        ctx.drawImage(noteImg, note.x, note.y, note.size, note.size);
    }

    requestAnimationFrame(animate);
}

noteImg.onload = () => animate();

// Redimensionnement dynamique
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});
