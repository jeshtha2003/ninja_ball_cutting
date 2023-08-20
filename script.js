const playButton = document.getElementById('startGameBtn');
const startGameContainer = document.getElementById('startGame');
const inGameContainer = document.getElementById('inGameContainer');

const gameStartSound = new Audio('./Sound_Source/Game-start.wav')
const gameEndSound = new Audio('./Sound_Source/Game-over.wav')
const bombTouchSound = new Audio('./Sound_Source/gank.wav')
const timeBeepSound = new Audio('./Sound_Source/time-beep.wav')
const buttonPushSound = new Audio('./Sound_Source/ui-button-push.wav')

let isSwordSoundPlaying = false;

const playSwordSound = ()=>{
    
    let swordAudio = new Audio(`./Sound_Source/Sword_Sound_Effects/Sword-swipe-${Math.floor(Math.random() * 6) + 1}.wav`);
    swordAudio.play();
    
    isSwordSoundPlaying = true;
    swordAudio.addEventListener('ended',()=>{
        
        isSwordSoundPlaying = false;
    })

}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        isGamePause = false;
    } else {
        isGamePause = true;
    }

})

playButton.addEventListener('click', () => {
    startGameContainer.style.display = 'none';
    inGameContainer.style.display = 'flex';
    alertTimer();
    score = 0;
    updateScore(0);
    gameStartSound.play();
    isGameStarted = true;
    isGameEnd = false;

    setTimeout(() => {
        animate();
        startRenderingBallsInterval();
        startGameTimer();
    }, 4000)
})

const alertTimer = () => {
    const countDownContainer = document.getElementById('countDownContainer');
    let currentSecond = 3;
    let timerInterval = setInterval(() => {
        countDownContainer.innerHTML = ``;
        countDownContainer.innerHTML = `<h1>${currentSecond}</h1>`;
        currentSecond -= 1;
        if (currentSecond < 0) {
            clearInterval(timerInterval);
            countDownContainer.innerHTML = ``;
            isGamePause = false;
            return
        }
        timeBeepSound.play()
    }, 1000)
}

const startGameTimer = () => {
    if (!isGameStarted) {
        return
    }
    let minutesInGame = 2;
    let totalTime = minutesInGame * 60;

    let interval = setInterval(() => {

        let min = Math.floor(totalTime / 60);
        let sec = totalTime % 60;

        document.getElementById('gameMinuteAndSecond').innerHTML = `${min < 10 ? '0' + min : min} : ${sec < 10 ? '0' + sec : sec}`

        totalTime--;

        if (totalTime < 0) {
            clearInterval(interval);
            document.getElementById('gameMinuteAndSecond').innerHTML = `00 : 00`;
            endGameContainer.style.display = 'flex';
            document.getElementById('endGameScore').innerHTML = score;
            isGameEnd = true;
            isGameStarted = false;
            gameEndSound.play();
            //Clearing the canvas
            ballArray = [];
            ballParticlesArray = [];
            enemyBombArray = [];
        }
    }, 1000)
}

let score = 0;

let highScore = localStorage.getItem('highScore') || 0;
document.getElementById('highScore').innerHTML = highScore;
document.getElementById('homeHighScore').innerHTML = highScore;

const updateScore = (noOfScore) => {

    if (noOfScore + score < 0) {
        score = 0;
        return
    }
    score = score + noOfScore;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        document.getElementById('highScore').innerHTML = score;
        document.getElementById('homeHighScore').innerHTML = score;
    }
    document.getElementById('score').innerHTML = score;
}

updateScore(0);

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ballArray = [];
let ballParticlesArray = [];
let enemyBombArray = [];


function Ball() {

    this.x = Math.floor(Math.random() * window.innerWidth);
    this.y = Math.floor(window.innerHeight);
    this.size = Math.floor((Math.random() * 10) + 35);
    this.color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 40%)`;

    this.speedY = 10;
    this.speedX = Math.round((Math.random() - 0.5) * 4);

    
    this.update = () => {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.speedY -= .1;
    }

    
    this.draw = () => {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}


function BallParticles(x, y, color) {

    this.x = x;
    this.y = y;
    this.size = Math.floor(Math.random() * 3 + 8);
    this.color = color;

    this.speedY = Math.random() * 2 - 2;
    this.speedX = Math.round((Math.random() - 0.5) * 10);

    
    this.update = () => {
        
        if (this.size > .2) {
            this.size -= .1;
        }
        this.y += this.speedY;
        this.x += this.speedX;
    }

    
    this.draw = () => {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}



function EnemyBomb() {

    this.x = Math.floor(Math.random() * window.innerWidth);
    this.y = Math.floor(window.innerHeight);
    this.size = Math.floor((Math.random() * 10) + 40);
    this.color = `black`;

    this.speedY = 10;
    this.speedX = Math.round((Math.random() - 0.5) * 4);

    //Updating Bomb Position
    this.update = () => {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.speedY -= .1;
    }

    this.draw = () => {
        context.fillStyle = this.color;
        context.beginPath();
        context.lineWidth = 6;
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.strokeStyle = 'red';
        context.stroke();
        context.fill();
    }
}


let strikeCount = 1;

let lastBallSlice;

function renderBalls() {
    for (let i = 0; i < ballArray.length; i++) {
        ballArray[i].draw();
        ballArray[i].update();

        
        let distanceBetweenMouseAndBall = Math.hypot(mouseX - ballArray[i].x, mouseY - ballArray[i].y)

        
        if (distanceBetweenMouseAndBall - ballArray[i].size < 1) {

           
            for (let index = 0; index < 8; index++) {
                ballParticlesArray.push(new BallParticles(ballArray[i].x, ballArray[i].y, ballArray[i].color));
            }
            let timeNow = new Date().getTime()
            
            if (timeNow - lastBallSlice < 500) {
                strikeCount += 1;
                document.getElementById('strikeCountDiv').innerHTML = `<h1 class="strikeCount">${strikeCount}x</h1>`
            } else {
                strikeCount = 1;
                document.getElementById('strikeCountDiv').innerHTML = `<h1 class="strikeCount">${strikeCount}x</h1>`
            }
            lastBallSlice = new Date().getTime();
            
            let scoreToUpdate = (ballArray[i].size < 40 ? 3 : 5) + strikeCount;
            updateScore(scoreToUpdate)

            
            ballArray.splice(i, 1);
            i--;
            return
        }

        
        if (ballArray[i].y > window.innerHeight + 10) {
            ballArray.splice(i, 1);
            i--;
        }
    }
}


function renderEnemyBombs() {
    for (let i = 0; i < enemyBombArray.length; i++) {
        enemyBombArray[i].draw();
        enemyBombArray[i].update();

        
        let distanceBetweenMouseAndEnemy = Math.hypot(mouseX - enemyBombArray[i].x, mouseY - enemyBombArray[i].y)

        
        if (distanceBetweenMouseAndEnemy - enemyBombArray[i].size < 1) {

            if (isGamePause) {
                return
            }
            
            ballArray = [];
            ballParticlesArray = [];
            isGamePause = true;
            
            alertTimer();
            updateScore(-7);
            bombTouchSound.play();
            
            enemyBombArray.splice(i, 1);
            i--;
            return
        }

       
        if (enemyBombArray[i].y > window.innerHeight + 10) {
            enemyBombArray.splice(i, 1);
            i--;
        }
    }
}



function renderBallParticles() {
    for (let i = 0; i < ballParticlesArray.length; i++) {
        ballParticlesArray[i].draw();
        ballParticlesArray[i].update();

        
        if (ballParticlesArray[i].size <= .2) {
            ballParticlesArray.splice(i, 1);
            i--;
        }
    }
}

let numberOfBallsToRender = [1, 2, 3, 4, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1];


const startRenderingBallsInterval = () => {
    let interval = setInterval(() => {
        
        if (isGameEnd) {
            clearInterval(interval)
            return;
        }
        
        if (isGamePause) {
            return
        }
        const numberOfBalls = Math.round(Math.random() * numberOfBallsToRender.length);
        let indexOf = numberOfBallsToRender[numberOfBalls];

        
        if (numberOfBalls >= Math.floor(numberOfBallsToRender.length / 2)) {
            enemyBombArray.push(new EnemyBomb())
        }

        for (let i = 0; i < indexOf; i++) {
            ballArray.push(new Ball())
        }

    }, 1000)
}


let isGameStarted = false;
let isGamePause = false;
let isGameEnd = false;

let animationId;


function animate() {
    context.fillStyle = 'rgba(24,28,31,.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    renderBalls();
    renderBallParticles();
    renderEnemyBombs();
    renderMouseLines();
    
    if (isGameEnd) {
        cancelAnimationFrame(animationId);
        return
    }
    animationId = requestAnimationFrame(animate);
}



let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let isMouseClicked = false;

let linesArray = [];

function renderMouseLines() {
    for (let i = 0; i < linesArray.length; i++) {
        context.strokeStyle = 'white';
        context.beginPath();
        
        context.moveTo(linesArray[i].x, linesArray[i].y);
        context.lineTo(linesArray[i].pMouseX, linesArray[i].pMouseY);
        context.stroke();
        context.lineWidth= 4;
        context.closePath();
    }
    
    if (linesArray.length > 4) {
        if (!isSwordSoundPlaying) {
            playSwordSound();  
        }
        linesArray.shift();
        linesArray.shift();
    }
}



canvas.addEventListener('mousedown', (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseClicked = true;
})


canvas.addEventListener('mousemove', (e) => {
    if (isMouseClicked) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        linesArray.push({x: mouseX,y:mouseY,pMouseX: prevMouseX,pMouseY: prevMouseY})
    }
})


canvas.addEventListener('mouseup', () => {
    mouseX = 0;
    mouseY = 0;
    linesArray = [];
    isMouseClicked = false;
})

canvas.addEventListener('mouseout', () => {
    mouseX = 0;
    linesArray = [];
    mouseY = 0;
    isMouseClicked = false;
})


const returnHomeButton = document.getElementById('returnHome');
const endGameContainer = document.getElementById('gameEndDiv');

returnHomeButton.addEventListener('click',()=>{
    if (!isGameEnd) {
        return
    }
    buttonPushSound.play();
    endGameContainer.style.display = 'none';
    startGameContainer.style.display = 'flex';
    inGameContainer.style.display = 'none';
})