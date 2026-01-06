hereconst canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.5;

class Player {
    constructor() {
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 0 };
        this.width = 30;
        this.height = 30;
    }

    draw() {
        ctx.fillStyle = 'red'; // لون اللاعب (ماريو)
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        // إضافة الجاذبية
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0; // التوقف عند لمس الأرض
        }
    }
}

const player = new Player();
const keys = { right: false, left: false };

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // مسح الشاشة لرسم الإطار الجديد
    
    player.update();

    // تحريك اللاعب يميناً ويساراً
    if (keys.right) player.velocity.x = 5;
    else if (keys.left) player.velocity.x = -5;
    else player.velocity.x = 0;
}

animate();

// التحكم بالمفاتيح
window.addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65: keys.left = true; break;  // حرف A
        case 68: keys.right = true; break; // حرف D
        case 87: player.velocity.y -= 15; break; // حرف W للقفز
    }
});

window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: keys.left = false; break;
        case 68: keys.right = false; break;
    }
});
