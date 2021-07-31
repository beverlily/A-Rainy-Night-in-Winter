let score;
let drops;
let gameWidth;
let basketWidth;

const maxDrops = 100;
const maxSnow = 30;

// Variables for timers
let fallingSnow;
let fallingDrop;
let checkCollision;

$(document).ready(function () {
  showInitialScreen();
  setStartButton();
});

const showInitialScreen = () => {
  $("#game-start").hide();
  $("#game-over").hide();
  $("#instructions-page").show();
};

const setStartButton = () => {
  $("#start-btn").click(startGame);
  $("#start-btn").keyup(function (e) {
    if (e.keyCode == 13) startGame();
  });
};

const startGame = () => {
  resetGame();
  setScore();
  fadeInMusic();

  moveBasketListener();

  clearInterval(checkCollision);
  checkCollision = setInterval(collision, 0);
  collision();

  startSnow();
  startDrop();
  setBackButton();
};

const moveBasketListener = () => {
  $(document).mousemove((e) => {
    gameWidth = $("#game").width();
    basketWidth = $("#basket").width();

    // x-coord of mouse relative to doc - x-coord of game container relative to doc
    // This is because basket is position relative to game container
    let leftValue = e.pageX - $("#game").offset().left;

    // To make sure that basket doesn't go out of the game container
    const minLeft = 0;
    const maxLeft = gameWidth - basketWidth;

    if (leftValue < minLeft) {
      leftValue = minLeft;
    } else if (leftValue > maxLeft) {
      leftValue = maxLeft;
    }

    $("#basket").css({ left: leftValue });
  });
};

const collision = () => {
  $(".drop").each(function () {
    const basketTop = $("#basket").position().top;
    const dropTop = $(this).position().top;
    const dropPos = $(this).position().left;
    const basketLeftCorner = $("#basket").position().left;
    const basketRightCorner = $("#basket").position().left + basketWidth;

    const dropInBasket =
      dropTop >= basketTop &&
      dropPos >= basketLeftCorner &&
      dropPos <= basketRightCorner;

    if (dropInBasket) {
      playDropSound();
      removeDrop(this);
      updateScore();
    }
  });
};

const playDropSound = () => {
  const dropSound = $("#drop-sound")[0];
  dropSound.currentTime = 0;
  dropSound.volume = 0.25;
  dropSound.play();
};

const removeDrop = (drop) => {
  $(drop).remove();
  $("#basket").addClass("water");
};

const updateScore = () => {
  score++;
  setScore();
};

const resetGame = () => {
  $("#game-over").hide();
  $("#instructions-page").hide();
  $("#basket").removeClass("water");
  $("#game-start").show();

  score = 0;
  drops = 0;
};

const fadeInMusic = () => {
  $("#background-music")[0].volume = 0.1;
  $("#background-music")[0].play();
  $("#background-music").animate({ volume: 0.5 }, 0.0);
};

const setScore = () => $("#score").html(`SCORE: ${score}`);

const randomizeNumber = (min, max) => Math.random() * (max - min) + min;

const makeSnow = () => {
  const minSize = 1;
  const maxSize = 5;
  const minSpeed = 10;
  const maxSpeed = 15;
  const minTop = -200;
  const maxTop = 100;
  const minLeft = maxSize;
  const maxLeft = 500 - maxSize;
  const minFade = 5;
  const maxFade = 10;
  const minSway = 5;
  const maxSway = 10;

  //Possible glow animations
  const glowOptions = [
    "",
    ", glow 1.5s infinite linear",
    ", glow 1s infinite linear",
  ];

  // Possible opacity values
  const opacityValues = ["0.25", "0.5", "0.75"];

  // Randomized variables within a certain range
  const top = randomizeNumber(minTop, maxTop);
  const left = randomizeNumber(minLeft, maxLeft);
  const size = randomizeNumber(minSize, maxSize);
  const fade = randomizeNumber(minFade, maxFade);
  const speed = randomizeNumber(minSpeed, maxSpeed);
  const sway = randomizeNumber(minSway, maxSway);

  const glow = glowOptions[Math.floor(Math.random() * glowOptions.length)];
  const opacity =
    opacityValues[Math.floor(Math.random() * opacityValues.length)];

  const snow = $(document.createElement("div"));
  snow.addClass("snow");
  snow.css({
    height: `${size}px`,
    width: `${size}px`,
    top: `${top}px`,
    left: `${left}px`,
    border: "1px solid white",
    opacity: opacity,
    animation: `fadeIn ${fade}s 1 ease-in forwards, fallFade ${speed}s 1 linear forwards ${glow}, sway ${sway}s infinite`,
  });

  $("#snow-container").append(snow);
  // Deletes snow when it's done falling
  snow.on("animationend", function (e) {
    const animationName = e.originalEvent.animationName;
    if (animationName == "fallFade") $(this).remove();
  });
};

// Snow
const startSnow = () => {
  clearInterval(fallingSnow);
  $("#snow-container .snow").remove();
  fallingSnow = setInterval(makeSnow, 1500);
};

const stopSnow = () => {
  clearInterval(fallingSnow);
  // Clear existing snow
  $("#snow-container .snow").remove();
};

const makeDrop = () => {
  if (drops < maxDrops) {
    const drop = $(document.createElement("img"));
    drop.attr("src", "images/drop.png");
    drop.attr("alt", "blue teardrop");

    const dropWidth = 15;
    const minLeft = dropWidth;
    const maxLeft = gameWidth - dropWidth;
    const minSpeed = 0.5;
    const maxSpeed = 1;
    const top = dropWidth;
    const left = randomizeNumber(minLeft, maxLeft);
    const speed = randomizeNumber(minSpeed, maxSpeed);

    drop.addClass("drop");
    drop.css({
      position: "absolute",
      width: dropWidth,
      top: `${top}px`,
      left: `${left}px`,
      animation: `glow 1.5s infinite linear, fallDrop ${speed}s 1 linear forwards`,
    });

    $("#drop-container").append(drop);
    drops++;

    // Deletes drop when it's done falling
    drop.on("animationend", function (e) {
      const animationName = e.originalEvent.animationName;
      if (animationName === "fallDrop") $(this).remove();
    });
  }
  // If no more drops left
  else {
    stopDrop();
    setTimeout(() => showGameOverModal(), 1000);
  }
};

const showGameOverModal = () => {
  $("#game-over").show();
  $("#game-over-content").hide();
  $("#game-over-content").html("YOUR SCORE: " + score);
  $("#game-over-content").show();
  
  $(document).keyup(function (e) {
    if (e.keyCode == 27) $("#game-over").fadeOut();
  });

  $("#play-again .button").click(() => playAgain());

  $("#play-again .button").keyup(function (e) {
    if (e.keyCode == 13) {
      startGame();
    }
  });
};

const playAgain = () => {
  stopSnow();
  clearExistingDrops();
  startGame();
};

// Drop
const startDrop = () => {
  stopDrop();
  clearExistingDrops();
  fallingDrop = setInterval(makeDrop, 500);
};

const stopDrop = () => clearInterval(fallingDrop);

const clearExistingDrops = () => {
  $("#drop-container .drop").remove();
};

const setBackButton = () => {
  $("#back-btn .button").click(() => back());
  $("#back-btn .button").keyup((e) => {
    if (e.keyCode == 13) back();
  });
};

const back = () => {
  stopDrop();
  stopSnow();
  clearExistingDrops();
  showInitialScreen();
};
