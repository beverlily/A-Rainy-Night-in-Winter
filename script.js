var score = 0;
var maxDrops = 50;
var drops = maxDrops;
var gameWidth;
var basketWidth;
var maxSnow = 25;

//Variables for timers
var fallingSnow;
var fallingDrop;
var checkCollision;

$(document).ready(function() {
    //Start Game
    $("#game-start").hide();
    $("#game-over").hide();
    $("#start-btn").click(startGame);
    $("#start-btn").keyup(function(e){
        if (e.keyCode == 13) {
            startGame();
        }
    });

    function startGame() {
        $("#game-over").hide();
        $("#instructions-page").hide();
        $("#basket").removeClass("water");
        drops = maxDrops;
        score = 0;
        $("#score").html("SCORE: " + score);

        //https://stackoverflow.com/questions/21611448/how-to-have-fade-in-out-on-audio-html5
        //Fades in music
        $('#background-music')[0].volume = 0.1;
        $('#background-music')[0].play();
        $('#background-music').animate({
            volume: 0.5
        }, 0.0);

        //Hide instruction page
        $("#instructions-page").hide();
        $("#game-start").show();

        //Moves basket depending on position of mouse
        $(document).mousemove(function(e) {
            gameWidth = $("#game").width();
            basketWidth = $("#basket").width();

            //x-coord of mouse relative to doc - x-coord of game container relative to doc
            //This is because basket is position relative to game container
            var leftValue = (e.pageX - $("#game").offset().left);

            //To make sure that basket doesn't go out of the game container
            var minLeft = 0;
            var maxLeft = gameWidth - basketWidth;

            if (leftValue < minLeft) {
                leftValue = minLeft;
            } else if (leftValue > maxLeft) {
                leftValue = maxLeft;
            }

            $('#basket').css({
                'left': leftValue
            });
        });

        clearInterval(checkCollision);
        checkCollision = setInterval(collision, 0);

        function collision() {
            $(".drop").each(function() {
                var basketTop = $("#basket").position().top;
                var dropTop = $(this).position().top;
                var dropPos = $(this).position().left;
                var basketLeftCorner = $("#basket").position().left;
                var basketRightCorner = $("#basket").position().left + basketWidth;

                //Drop is within the basket container
                if (dropTop >= basketTop && dropPos >= basketLeftCorner &&
                    dropPos <= basketRightCorner) {

                    //Referenced https://stackoverflow.com/questions/12953928/immediate-play-sound-on-button-click-in-html-page
                    //Drop sound every time a drop is catched
                    var dropSound = $('#drop-sound')[0];
                    dropSound.currentTime = 0;
                    dropSound.volume = 0.25;
                    dropSound.play();

                    //Remove drop
                    $(this).remove();
                    $("#basket").addClass("water");

                    //Update score
                    score += 1;
                    $("#score").html("SCORE: " + score);

                }
            });
        }

        function randomizeNumber(min, max) {
            return (Math.random() * (max - min)) + min;
        }

        //Snow
        function startSnow() {
            clearInterval(fallingSnow);
            $("#snow-container .snow").remove();
            fallingSnow = setInterval(makeSnow, 1500);
        }

        function stopSnow() {
            clearInterval(fallingSnow);
            //Clear existing snow
            $("#snow-container .snow").remove();
        }

        //Drop
        function startDrop() {
            clearInterval(fallingDrop);
            //Clear existing drop
            $("#drop-container .drop").remove();
            fallingDrop = setInterval(makeDrop, 500);
        }

        function stopDrop() {
            clearInterval(fallingDrop);
        }

        //Starts making snow + drops
        startSnow();
        startDrop();

        $("#back-btn .button").click(function() {
          back();
        });

        $("#back-btn .button").keyup(function(e){
          if (e.keyCode == 13){
            back();
          }
        });

        function back(){
          //Reset values
          stopDrop();
          stopSnow();
          //Clear existing drops
          $("#drop-container .drop").remove();
          $("#game-start").hide();
          $("#game-over").hide();
          $("#instructions-page").show();
        }

        function makeSnow() {
            var minSize = 1;
            var maxSize = 5;
            var minSpeed = 10;
            var maxSpeed = 15;
            var minTop = -200;
            var maxTop = 100;
            var minLeft = maxSize;
            var maxLeft = 500 - maxSize;
            var minFade = 5;
            var maxFade = 10;
            var minSway = 5;
            var maxSway = 10;

            //Possible glow animations
            var glowOptions = [", glow 1.5s infinite linear", "", ", glow 1s infinite linear", ];

            //Possible opacity values
            var opacityValues = ["0.25", "0.5", "0.75"];

            //Randomized variables within a certain range
            var top = randomizeNumber(minTop, maxTop);
            var left = randomizeNumber(minLeft, maxLeft);
            var size = randomizeNumber(minSize, maxSize);
            var fade = randomizeNumber(minFade, maxFade);
            var speed = randomizeNumber(minSpeed, maxSpeed);
            var sway = randomizeNumber(minSway, maxSway);

            /*Referenced https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array*/
            var glow = glowOptions[Math.floor(Math.random() * glowOptions.length)];
            var opacity = opacityValues[Math.floor(Math.random() * opacityValues.length)];

            //Referenced https://stackoverflow.com/questions/268490/jquery-document-createelement-equivalent
            var snow = $(document.createElement('div'));
            snow.addClass("snow");
            snow.css({
                "height": size + "px",
                "width": size + "px",
                "top": top + "px",
                "left": left + "px",
                "border": "1px solid white",
                "opacity": opacity,
                "animation": "fadeIn " + fade + "s 1 ease-in forwards, fallFade " +
                    speed + "s 1 linear forwards " + glow + ", sway " +
                    sway + "s infinite"
            });

            $("#snow-container").append(snow);

            //Referenced https://stackoverflow.com/questions/12498686/detect-which-css-animation-just-ended-in-javascript
            //Deletes snow when it's done falling
            snow.on("animationend", function(e) {
                var animationName = e.originalEvent.animationName;
                if (animationName == "fallFade") {
                    $(this).remove();
                }
            });
        } //end of makeSnow

        function makeDrop() {
            if (drops > 0) {
                var drop = $(document.createElement('img'));
                drop.attr('src', 'images/drop.png');
                drop.attr('alt', 'blue teardrop');

                var dropWidth = 15;
                var minLeft = dropWidth;
                var maxLeft = gameWidth - dropWidth;
                var minSpeed = 0.5;
                var maxSpeed = 1;
                var top = dropWidth;
                var left = randomizeNumber(minLeft, maxLeft);
                var speed = randomizeNumber(minSpeed, maxSpeed);

                drop.addClass("drop");
                drop.css({
                    "position": "absolute",
                    "width": dropWidth,
                    "top": top + "px",
                    "left": left + "px",
                    "animation": "glow 1.5s infinite linear, fallDrop " +
                        speed + "s 1 linear forwards "
                });

                $("#drop-container").append(drop);
                drops -= 1;

                //Deletes drop when it's done falling
                drop.on("animationend", function(e) {
                    var animationName = e.originalEvent.animationName;
                    if (animationName === "fallDrop") {
                        $(this).remove();
                    }
                });
            }
            //If no more drops left
            else {
                stopDrop();
                setTimeout(function() {
                    $("#game-over").show();
                    $("#game-over-content").hide();
                    $("#game-over-content").html("YOUR SCORE: " + score);
                    $("#game-over-content").show();
                    $(document).keyup(function(e){
                        if (e.keyCode == 27) {
                            $("#game-over").fadeOut();
                        }
                    });

                    $("#play-again .button").click(function(){
                      playAgain();
                    });

                    $("#play-again .button").keyup(function(e){
                        if (e.keyCode == 13) {
                            startGame();
                        }
                    });

                    function playAgain(){
                      stopSnow();
                      //Clear existing drops
                      $("#drop-container .drop").remove();
                      $("#game-start").hide();
                      $("#game-over").hide();
                      startGame();
                    }
                  }, 1000);
            }
        } //end of makeDrop
    } //end of start game
}); //end of document ready
