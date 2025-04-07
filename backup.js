const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); //2D遊戲
//getContext()會回傳一個canvas的drawing context
//drawing context可以用來在canvas內畫圖
const unit = 40; //蛇一單位多少長度 全長為320 所以蛇最多16格
const row = canvas.height / unit; //320/16= 20
const column = canvas.width / unit; //320/16= 20
const bgImage = new Image();
bgImage.src = "background.jpg"; //

let snake = []; //這個array中的每個元素都是一個物件
function creatSnack() {
  //該些物件的用途是儲存身體x,y的座標
  snake[0] = {
    x: 80,
    y: 0,
  };
  snake[1] = {
    x: 60,
    y: 0,
  };
  snake[2] = {
    x: 40,
    y: 0,
  };
  snake[3] = {
    x: 20,
    y: 0,
  };
}

class Fruit {
  constructor() {
    this.pickALocation();
    this.image = new Image(); // 創建蘋果圖片
    this.image.src = "apple.png"; // 替換為你的蘋果圖片路徑
  }
  drawFruit() {
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
creatSnack();
let myFruit = new Fruit();

//修改
let imagesLoaded = 0;
const totalImages = 2; // 背景和蘋果圖片

function checkAllImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawInitial(); // 所有圖片載入完成後才呼叫 drawInitial
  }
}

bgImage.onload = checkAllImagesLoaded; // 監聽背景圖片載入
myFruit.image.onload = checkAllImagesLoaded; // 監聽蘋果圖片載入
bgImage.onerror = () => console.error("背景圖片載入失敗"); // 圖片載入失敗時輸出錯誤
myFruit.image.onerror = () => console.error("蘋果圖片載入失敗"); // 圖片載入失敗時輸出錯誤

//bgm
const bgm = new Audio("bgm1.mp3"); // 替換為你的 BGM 檔案路徑
bgm.loop = true; // 設置循環播放
bgm.volume = 0.3; // 設置音量（0.0 到 1.0），避免蓋過其他音效
let BgmStarted = false; // 追蹤 BGM 是否已開始

//改變方向
window.addEventListener("keydown", changeDirection);
let direction = "Right"; //初始方向:往右
function changeDirection(e) {
  if (e.key == "ArrowRight" && direction != "Left") {
    direction = "Right";
  } else if (e.key == "ArrowDown" && direction != "Up") {
    direction = "Down";
  } else if (e.key == "ArrowLeft" && direction != "Right") {
    direction = "Left";
  } else if (e.key == "ArrowUp" && direction != "Down") {
    direction = "Up";
  }

  if (!BgmStarted) {
    bgm.play().catch((error) => console.log("BGM 播放失敗:", error));
    BgmStarted = true;
  }

  //draw d ="left", d= "up" , d ="right"
  //在下一次draw之前 造成大迴轉導致蛇自殺
  //所以要在上面第一次改變方向後，remove keydown事件
  //等到draw()都結束的最後一步再放回changeDirection
  window.removeEventListener("keydown", changeDirection);
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
  //每次新的圖開始畫之前 確認蛇有沒有咬到自己
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      alert("GAME OVER");
      return; //以下皆不會執行
    }
  }
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
      playSound("wall.mp4");
      snake[i].x = 0;
    }
    if (snake[i].x < 0) {
      playSound("wall.mp4");
      snake[i].x = canvas.width - unit;
    }
    if (snake[i].y >= canvas.height) {
      playSound("wall.mp4");
      snake[i].y = 0;
    }
    if (snake[i].y < 0) {
      playSound("wall.mp4");
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
    playSound("eat.mp4");
    //重新選定新的隨機位置
    myFruit.pickALocation();
    //劃出新果實
    myFruit.drawFuit();
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

  snake.unshift(newHead); //增加新的頭
  //結束音效
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      playSound("gameover.wav");
      bgm.pause();
    }
  }
  window.addEventListener("keydown", changeDirection);
}
function drawInitial() {
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  myFruit.drawFuit();
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "darkgreen" : "lightgreen";
    ctx.strokeStyle = "darkgray";
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }
  ctx.fillStyle = "white";
  ctx.font = "20px 'Baloo 2', cursive";
  ctx.textAlign = "center";
  ctx.fillText("按方向鍵開始遊戲", canvas.width / 2, canvas.height / 2);
}
let myGame = setInterval(draw, baseInterval);

function loadHighScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

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
}
