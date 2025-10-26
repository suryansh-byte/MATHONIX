const backend = "http://localhost:3030";
const display = document.getElementById('display');
const buttonsContainer = document.querySelector('.buttons');
const historyList = document.getElementById('history-list');
const voiceBtn = document.getElementById('voice-btn');
const clearHistoryBtn = document.getElementById('clear-history');
// --- THEME SWITCHER ---
const themeSelector = document.getElementById('theme-selector');
const body = document.body;
themeSelector.onchange = function() {
    body.classList.remove(...["light","dark","matrix","futuristic"]);
    const sel = this.value;
    if (sel !== "default") body.classList.add(sel);
    else body.className = '';
    runDynamicBg();
};
if (localStorage.getItem('mathionix-theme')) {
    themeSelector.value = localStorage.getItem('mathionix-theme');
    themeSelector.onchange();
}
themeSelector.addEventListener('change', () =>
    localStorage.setItem('mathionix-theme', themeSelector.value));
// --- CALCULATOR ---
const btns = [
    '7','8','9','/','sqrt',
    '4','5','6','*','^',
    '1','2','3','-','log',
    '0','.','+','(',')',
    'sin','cos','tan','π','e',
    'C','DEL','ANS','=',''
];
let ans = "", userInput = "";
btns.forEach(label => {
    if (label === '') return;
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => onBtnPress(label);
    buttonsContainer.appendChild(btn);
});
function onBtnPress(label) {
    if (label === 'C') { userInput = ""; display.value = ""; }
    else if (label === 'DEL') { userInput = userInput.slice(0, -1); display.value = userInput; }
    else if (label === 'ANS') { userInput += ans; display.value = userInput; }
    else if (label === '=') calculate();
    else if (['sqrt','sin','cos','tan','log'].includes(label)) {
        userInput += label + "(";
        display.value = userInput;
    }
    else if (label === 'π') { userInput += 'pi'; display.value = userInput; }
    else if (label === 'e') { userInput += 'e'; display.value = userInput; }
    else { userInput += label; display.value = userInput; }
}
function calculate() {
    fetch(`${backend}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: userInput })
    }).then(res=>res.json()).then(data=>{
        if (data.result !== undefined) {
            ans = data.result;
            display.value = data.result;
            userInput = "";
            fetchHistory();
        } else display.value = data.error;
    })
    .catch(()=>{ display.value="Error!"; });
}
function fetchHistory() {
    fetch(`${backend}/api/history`)
    .then(res=>res.json())
    .then(history => {
        historyList.innerHTML = "";
        history.forEach(item=>{
            const li = document.createElement('li');
            li.textContent = `${item.expression} = ${item.result}`;
            historyList.appendChild(li);
        });
    });
}
fetchHistory();
clearHistoryBtn.onclick = ()=> {
    fetch(`${backend}/api/clear-history`,{method:"POST"}).then(fetchHistory);
};
// --- VOICE ---
voiceBtn.onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return display.value = "Voice not supported!";
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.start();
    display.value = "Listening...";
    recog.onresult = e => {
        let transcript = e.results[0][0].transcript
            .replace(/plus/gi, "+").replace(/minus/gi,"-").replace(/into|multiply/gi, "*")
            .replace(/divided by|over/gi, "/").replace(/power/gi,"^")
            .replace(/point/gi,".")
            .replace(/square root/gi,"sqrt")
            .replace(/pi/gi,"pi")
            .replace(/logarithm|log/gi,"log")
            .replace(/sin/gi,"sin").replace(/cos/gi,"cos").replace(/tan/gi,"tan");
        userInput += transcript;
        display.value = userInput;
    };
    recog.onerror = e => display.value = "Try again!";
};
// --- DIGITAL CLOCK ---
function updateClock() {
    const clock = document.getElementById('clock');
    if (!clock) return;
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    let h = pad(now.getHours());
    let m = pad(now.getMinutes());
    let s = pad(now.getSeconds());
    clock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();
// --- DYNAMIC BACKGROUND ---
function runDynamicBg() {
    const bg = document.getElementById('dynamic-bg');
    bg.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bg.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let t = 0;
    let draw;
    if (body.classList.contains("matrix")) {
        const cols = Math.floor(window.innerWidth / 16) + 1;
        let y = Array(cols).fill(0);
        draw = function matrix() {
            ctx.fillStyle = "#0003";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "15px monospace";
            ctx.fillStyle = "#2fa62f";
            y.forEach((v, i) => {
                const txt = String.fromCharCode(0x30A0 + Math.random()*96);
                ctx.fillText(txt, i*16, v);
                y[i] = v > canvas.height + Math.random()*140 ? 0 : v + 18;
            });
            requestAnimationFrame(matrix);
        };
    } else if (body.classList.contains("light")) {
        draw = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<50;i++){
                ctx.beginPath();
                ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*15+7,0,2*Math.PI);
                ctx.fillStyle=`rgba(${170+Math.random()*80},${170+Math.random()*80},${170+Math.random()*80},0.42)`;
                ctx.fill();
            }
            setTimeout(draw,350);
        };
    } else if (body.classList.contains("futuristic")) {
        draw = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<90;i++){
                let x=Math.sin(t+i/7)*200+canvas.width/2;
                let y=Math.cos(t+i/3)*120+canvas.height/2;
                ctx.beginPath();
                ctx.arc(x,y,17+14*Math.sin(t+i/3),0,2*Math.PI);
                ctx.fillStyle=`hsla(${170+i*2+t*70},90%,78%,0.09)`;
                ctx.fill();
            }
            t+=0.015;
            requestAnimationFrame(draw);
        };
    } else {
        draw = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for(let i=0;i<120;i++){
                let x=canvas.width/2+Math.sin(t+i)*400*Math.sin(i/8)+Math.random()*8;
                let y=canvas.height/2+Math.cos(t/2+i/2)*200*Math.cos(i/9)+Math.random()*8;
                ctx.beginPath();
                ctx.arc(x,y,20+13*Math.sin(t+i/3),0,2*Math.PI);
                ctx.fillStyle=`hsla(${t*70+i*3},70%,60%,0.07)`;
                ctx.fill();
            }
            t+=0.01;
            requestAnimationFrame(draw);
        };
    }
    draw();
    window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
}
runDynamicBg();
// --- FOOTBALL GAME ---
const footballToggle = document.getElementById('football-toggle');
const footballContainer = document.getElementById('football-game-container');
const footballCanvas = document.getElementById('football-canvas');
const matchScore = document.getElementById('match-score');
let gameActive = false;
footballToggle.onclick = () => {
    if (footballContainer.style.display === "none") {
        footballContainer.style.display = "block";
        startFootballGame();
    } else {
        footballContainer.style.display = "none";
        stopFootballGame();
    }
};
let footballGameRAF;
let football, keys;
function startFootballGame(){
    footballCanvas.width = 600; footballCanvas.height = 300;
    football = {
        ball: {x:300, y:150, vx:0, vy:0, r:13},
        player: {x:50, y:150, w:16, h:60, vy:0, score:0},
        ai: {x:550, y:150, w:16, h:60, vy:0, score:0},
        state: "play"
    };
    keys = {};
    document.addEventListener('keydown', footballKeydown);
    document.addEventListener('keyup', footballKeyup);
    footballLoop();
}
function stopFootballGame(){
    cancelAnimationFrame(footballGameRAF);
    matchScore.textContent = '';
    document.removeEventListener('keydown', footballKeydown);
    document.removeEventListener('keyup', footballKeyup);
}
function footballKeydown(e) { keys[e.code] = true; }
function footballKeyup(e) { keys[e.code] = false; }
function footballLoop() {
    const ctx = footballCanvas.getContext("2d");
    ctx.clearRect(0, 0, footballCanvas.width, footballCanvas.height);
    ctx.fillStyle = "#079a2b"; ctx.fillRect(0,0,600,300);
    ctx.strokeStyle="#fff"; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.moveTo(300,0); ctx.lineTo(300,300); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(300,150,60,0,2*Math.PI); ctx.stroke();
    ctx.strokeRect(0,0,600,300);
    ctx.fillStyle="#1a5fff";
    ctx.fillRect(football.player.x, football.player.y-football.player.h/2, football.player.w, football.player.h);
    ctx.fillStyle="#900000";
    ctx.fillRect(football.ai.x, football.ai.y-football.ai.h/2, football.ai.w, football.ai.h);
    ctx.beginPath();
    ctx.arc(football.ball.x, football.ball.y, football.ball.r, 0, Math.PI*2);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.stroke();
    if (keys['ArrowUp']) football.player.y -= 4;
    if (keys['ArrowDown']) football.player.y += 4;
    football.player.y = Math.max(football.player.h/2, Math.min(300-football.player.h/2, football.player.y));
    football.ball.x += football.ball.vx; football.ball.y += football.ball.vy;
    football.ball.vx *= 0.992; football.ball.vy *= 0.992;
    if (Math.abs(football.ball.vx) < 0.1) football.ball.vx = 0;
    if (Math.abs(football.ball.vy) < 0.1) football.ball.vy = 0;
    if (football.ball.x-football.ball.r < football.player.x+football.player.w &&
        football.ball.y > football.player.y-football.player.h/2 &&
        football.ball.y < football.player.y+football.player.h/2 &&
        football.ball.x > football.player.x) {
        football.ball.x = football.player.x+football.player.w+football.ball.r;
        football.ball.vx = Math.abs(football.ball.vx)*1.03+2;
        football.ball.vy += (football.ball.y - football.player.y)/9 + (Math.random()-0.5);
    }
    if (football.ball.x+football.ball.r > football.ai.x &&
        football.ball.y > football.ai.y-football.ai.h/2 &&
        football.ball.y < football.ai.y+football.ai.h/2 &&
        football.ball.x < football.ai.x+football.ai.w) {
        football.ball.x = football.ai.x-football.ball.r;
        football.ball.vx = -Math.abs(football.ball.vx)*1.03-2;
        football.ball.vy += (football.ball.y - football.ai.y)/9 + (Math.random()-0.5);
    }
    if (football.ball.y<football.ball.r) { football.ball.y = football.ball.r; football.ball.vy = -football.ball.vy; }
    if (football.ball.y>300-football.ball.r) { football.ball.y = 300-football.ball.r; football.ball.vy = -football.ball.vy; }
    if (football.ai.y < football.ball.y-16) football.ai.y += 2.1+Math.random();
    if (football.ai.y > football.ball.y+16) football.ai.y -= 2.1+Math.random();
    football.ai.y = Math.max(football.ai.h/2, Math.min(300-football.ai.h/2, football.ai.y));
    if (football.ball.x<0) { football.ai.score++; resetFootBall(); }
    if (football.ball.x>600) { football.player.score++; resetFootBall(); }
    matchScore.textContent = `Player: ${football.player.score} - Computer: ${football.ai.score}`;
    footballGameRAF = requestAnimationFrame(footballLoop);
}
window.addEventListener('keydown', function(e){
    if (footballContainer.style.display === "block" && e.code === "Space" && football && football.ball.vx === 0 && football.ball.vy === 0) {
        football.ball.vx = 8; football.ball.vy = (Math.random()-0.5)*2.5;
    }
});
function resetFootBall() {
    football.ball.x = 300; football.ball.y = 150;
    football.ball.vx = (Math.random() < 0.5 ? 1 : -1) * 6;
    football.ball.vy = (Math.random()-0.5)*2;
}
