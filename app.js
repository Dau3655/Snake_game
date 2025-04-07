const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); //2D遊戲
//getContext()會回傳一個canvas的drawing context
//drawing context可以用來在canvas內畫圖
const unit = 30; //蛇一單位多少長度 全長為320 所以蛇最多16格
const row = canvas.height / unit; //320/16= 20 480/30 = 16
const column = canvas.width / unit; //320/16= 20
const bgImage = new Image();
bgImage.src = "./picture/background.jpg"; //

let snake = []; //這個array中的每個元素都是一個物件
function createSnack() {
  //該些物件的用途是儲存身體x,y的座標
  snake[0] = {
    x: 90,
    y: 0,
  };
  snake[1] = {
    x: 60,
    y: 0,
  };
  snake[2] = {
    x: 30,
    y: 0,
  };
  snake[3] = {
    x: 0,
    y: 0,
  };
}

class Fruit {
  constructor() {
    this.pickALocation();
    this.image = new Image(); // 創建蘋果圖片
    this.image.src = "./picture/apple.png";
  }
  drawFuit() {
    const appleSize = unit * 1.2;
    ctx.drawImage(this.image, this.x, this.y, appleSize, appleSize);
  }
  pickALocation() {
    //跟蛇的位置做比較
    let overlapping = false;
    let new_x;
    let new_y;

    function checkoverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlapping = true;
          return;
        } else {
          overlapping = false;
        }
      }
    }
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkoverlap(new_x, new_y);
    } while (overlapping);
    this.x = new_x;
    this.y = new_y;
  }
}

//初始設定
createSnack();
let myFruit = new Fruit();

let imagesLoaded = 0;
const totalImages = 2; // 背景和蘋果圖片

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawInitial(); // 所有圖片載入完成後才呼叫 drawInitial
  }
}

bgImage.onload = checkAllImagesLoaded; // 背景載入
myFruit.image.onload = checkAllImagesLoaded; // 蘋果載入
bgImage.onerror = () => console.error("背景圖片載入失敗"); // 錯誤處理
myFruit.image.onerror = () => console.error("蘋果圖片載入失敗"); // 錯誤處理

//bgm
let bgmInstance = null;

//改變方向
window.addEventListener("keydown", changeDirection);
let direction = "Right"; //初始方向:往右
let gameStart = false; //遊戲還沒開始
let myGame;

function changeDirection(e) {
  let directionChanged = false;

  if (e.key == "ArrowRight" && direction != "Left") {
    direction = "Right";
    directionChanged = true;
  } else if (e.key == "ArrowDown" && direction != "Up") {
    direction = "Down";
    directionChanged = true;
  } else if (e.key == "ArrowLeft" && direction != "Right") {
    direction = "Left";
    directionChanged = true;
  } else if (e.key == "ArrowUp" && direction != "Down") {
    direction = "Up";
    directionChanged = true;
  }
  //方向鍵改變方向+ 遊戲未開始，啟動遊戲
  if (directionChanged && !gameStart) {
    myGame = setInterval(draw, baseInterval);
    gameStart = true;
    bgmInstance = playSound("./music/bgm1.mp3");
    bgmInstance.loop = true;
    bgmInstance.volume = 0.3;
  }

  //draw d ="left", d= "up" , d ="right"
  //在下一次draw之前 造成大迴轉導致蛇自殺
  //所以要在上面第一次改變方向後，remove keydown事件
  //等到draw()都結束的最後一步再放回changeDirection
  if (gameStart) {
    window.removeEventListener("keydown", changeDirection);
  }
}

//遊戲分數設定
let score = 0;
let highestScore;
loadHighScore();
document.getElementById("myScore").innerHTML = "Score: " + score;
document.getElementById("myScore2").innerHTML = "HighestScore: " + highestScore;

//遊戲速度
let baseInterval = 100;
function updateSpeed() {
  clearInterval(myGame); // 清除舊計時器
  let newInterval = Math.max(50, baseInterval - score * 5); // 每分減少 5ms，最小 50ms
  myGame = setInterval(draw, newInterval); // 啟動新計時器
}

function draw() {
  //設定背景為黑色
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  myFruit.drawFuit();

  //畫蛇
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      //頭
      ctx.fillStyle = "darkgreen";
    } else {
      //身體
      ctx.fillStyle = "lightgreen";
    }

    //身體外框
    ctx.strokeStyle = "darkgray";

    //穿牆時XY的更正
    if (snake[i].x >= canvas.width) {
      playSound("./music/wall.mp4");
      snake[i].x = 0;
    }
    if (snake[i].x < 0) {
      playSound("./music/wall.mp4");
      snake[i].x = canvas.width - unit;
    }
    if (snake[i].y >= canvas.height) {
      playSound("./music/wall.mp4");
      snake[i].y = 0;
    }
    if (snake[i].y < 0) {
      playSound("./music/wall.mp4");
      snake[i].y = canvas.height - unit;
    }
    //填滿的顏色
    //參數為x y width height
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  //以目前的變數direction的方向決定蛇的下一偵要在哪個座標
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction == "Left") {
    snakeX -= unit;
  } else if (direction == "Up") {
    snakeY -= unit;
  } else if (direction == "Right") {
    snakeX += unit;
  } else if (direction == "Down") {
    snakeY += unit;
  }
  let newHead = {
    x: snakeX,
    y: snakeY,
  };
  //確認蛇有吃到果實
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    //吃果實音效
    playSound("./music/eat.mp4");
    //重新選定新的隨機位置
    myFruit.pickALocation();
    //更新速度
    updateSpeed();
    //更新分數
    score++;
    setHighestScore(score);
    document.getElementById("myScore").innerHTML = "Score: " + score;
    document.getElementById("myScore2").innerHTML =
      "HighestScore: " + highestScore;
  } else {
    snake.pop();
  }

  //增加新的頭
  snake.unshift(newHead);

  //結束音效
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      playSound("./music/gameover.wav");
      if (bgmInstance) {
        bgmInstance.pause();
        bgmInstance.currentTime = 0;
      }
      setTimeout(() => {
        alert("GAME OVER");
        gameStart = false;
      }, 100); // 延遲 100 毫秒，確保音效開始
      return;
    }
  }
  window.addEventListener("keydown", changeDirection);
}

// 初始畫面繪製
function drawInitial() {
  // 畫背景
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // 畫果實
  myFruit.drawFuit();

  // 畫蛇
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      //頭
      ctx.fillStyle = "darkgreen";
    } else {
      //身體
      ctx.fillStyle = "lightgreen";
    }
    ctx.strokeStyle = "darkgray"; // 外框
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  //開始前提示文字
  ctx.fillStyle = "white";
  ctx.font = "25px 'Baloo 2', cursive";
  ctx.textAlign = "center";
  ctx.fillText(
    "Press Arrow keys to start the game",
    canvas.width / 2,
    canvas.height / 2
  );
}
//最高分找不到則設為0 有的話存取並設為最高分
function loadHighScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

//刷新最高分
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}

//聲音
function playSound(src) {
  const sound = new Audio(src);
  sound.play();
  return sound;
}
