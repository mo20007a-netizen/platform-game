const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// جعل حجم الكانفاس يملأ الشاشة
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.8;
let scrollOffset = 0;

// فئة اللاعب
class Player {
    constructor() {
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 0 };
        this.width = 40;
        this.height = 40;
    }

    draw() {
        ctx.fillStyle = '#FF4500'; // لون ماريو
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.shadowBlur = 0; // إعادة الظل للصفر لبقية العناصر
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // نظام الجاذبية
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
        }
    }
}

// فئة المنصات
class Platform {
    constructor({ x, y, width, height }) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = '#228B22'; // لون العشب
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // إضافة خط بني كأنه تربة تحت العشب
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.position.x, this.position.y + 10, this.width, this.height - 10);
    }
}

const player = new Player();
const platforms = [
    new Platform({ x: 100, y: 400, width: 250, height: 40 }),
    new Platform({ x: 500, y: 250, width: 200, height: 40 }),
    new Platform({ x: 800, y: 450, width: 400, height: 40 }),
    new Platform({ x: 1300, y: 300, width: 300, height: 40 }),
    new Platform({ x: 0, y: canvas.height - 40, width: 5000, height: 40 }) // الأرضية الأساسية
];

const keys = {
    right: { pressed: false },
    left: { pressed: false }
};

// وظيفة التحريك المستمر
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    platforms.forEach(platform => platform.draw());
    player.update();

    // تحريك اللاعب أو تحريك الكاميرا (العالم)
    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = 5;
    } else if (keys.left.pressed && player.position.x > 100) {
        player.velocity.x = -5;
    } else {
        player.velocity.x = 0;

        if (keys.right.pressed) {
            scrollOffset += 5;
            platforms.forEach(platform => platform.position.x -= 5);
        } else if (keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= 5;
            platforms.forEach(platform => platform.position.x += 5);
        }
    }

    // اكتشاف التصادم مع المنصات
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
        }
    });

    // خسارة اللعبة إذا سقط ماريو في فجوة (اختياري)
    if (player.position.y > canvas.height) {
        location.reload(); // إعادة تشغيل اللعبة
    }
}

animate();

// --- التعامل مع اللمس (الموبايل) ---
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// وظائف مساعدة لبدء وإيقاف الحركة
const startLeft = () => keys.left.pressed = true;
const stopLeft = () => keys.left.pressed = false;
const startRight = () => keys.right.pressed = true;
const stopRight = () => keys.right.pressed = false;
const jump = () => { if (player.velocity.y === 0) player.velocity.y = -18; };

// أحداث اللمس
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startLeft(); });
leftBtn.addEventListener('touchend', stopLeft);
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRight(); });
rightBtn.addEventListener('touchend', stopRight);
jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

// أحداث الماوس (للتجربة على الكمبيوتر بالماوس)
leftBtn.onmousedown = startLeft;
leftBtn.onmouseup = stopLeft;
rightBtn.onmousedown = startRight;
rightBtn.onmouseup = stopRight;
jumpBtn.onmousedown = jump;

// --- دعم الكيبورد (الكمبيوتر) ---
window.addEventListener('keydown', ({ keyCode }) => {
    if (keyCode === 65 || keyCode === 37) keys.left.pressed = true; // A or LeftArrow
    if (keyCode === 68 || keyCode === 39) keys.right.pressed = true; // D or RightArrow
    if (keyCode === 87 || keyCode === 32 || keyCode === 38) jump(); // W, Space, UpArrow
});

window.addEventListener('keyup', ({ keyCode }) => {
    if (keyCode === 65 || keyCode === 37) keys.left.pressed = false;
    if (keyCode === 68 || keyCode === 39) keys.right.pressed = false;
});
