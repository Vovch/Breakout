'use strict';

class Player {

    constructor() {
        this._createModel();
        this.moveInit();
        this.moveLeft = 0;
        this.moveRight = 0;
        this.mousePosition = document.body.clientWidth / 2;
    }

    _createModel() {
        this.playerModel = document.createElement('div');

        this.playerModel.style.cssText = `
            width: 10%;
            height: 2%;
            position: absolute;
            bottom: 20px;
            left: 50%;
            margin-left: -5%;
            background-color: #333;
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
        `;

        document.body.appendChild(this.playerModel);

        return this.playerModel;
    }

    moveInit() {
        let moveSpeed      = 1;
        let moveKeyNumbers = [37, 65, 39, 68]; // Left, left, right, right
        var self = this;
        self.currentSpeed   = 0;
        document.addEventListener('keydown', function(event) {
            let key = event.keyCode;

            if (key == moveKeyNumbers[0] || key == moveKeyNumbers[1]) {
                self.moveLeft = moveSpeed;
            } else if (key == moveKeyNumbers[2] || key == moveKeyNumbers[3]) {
                self.moveRight = moveSpeed;
            }
        });
        document.addEventListener('keyup', function(event) {
            let key = event.keyCode;

            if (key == moveKeyNumbers[0] || key == moveKeyNumbers[1]) {
                self.moveLeft = 0;
            } else if (key == moveKeyNumbers[2] || key == moveKeyNumbers[3]) {
                self.moveRight = 0;
            }
        });
        document.addEventListener('mousemove', function(event) {
            self.mousePosition = event.pageX;
            //console.log(this.mousePosition);
        });
    }


    move() {
        let maxRightPosition = 95;
        let newPosition = this.mousePosition / document.body.clientWidth * 100;
        // Limit pad movement
        if (newPosition < 5) newPosition = 5;
        if (newPosition > maxRightPosition)
            newPosition = maxRightPosition;
        // Move
        this.playerModel.style.left = newPosition + '%';
    }
    //move() {
    //    if (this.moveRight || this.moveLeft) {
    //        this.currentSpeed = this.moveRight - this.moveLeft;
    //
    //        if (!model) var model = this.playerModel;
    //
    //        let currentPositionLeft = parseFloat(model.style.left);
    //        let maxRightPosition = 95;
    //        let newPosition = currentPositionLeft + this.currentSpeed;
    //        // Limit pad movement
    //        if (newPosition < 5) newPosition = 5;
    //        if (newPosition > maxRightPosition)
    //            newPosition = maxRightPosition;
    //
    //        // Move
    //        model.style.left = newPosition + '%';
    //    }
    //}

    getModel() {
        return this.playerModel;
    }
}

class Ball {
    constructor(associatedPlayer, ballSpeed) {
        this._createModel();
        this.playerModel = associatedPlayer.getModel();
        this._init(ballSpeed);
    }

    _init(ballSpeed) {
        this.ballSpeed = ballSpeed || 10;
        this.speedVertical = this.ballSpeed / Math.sqrt(2);
        this.speedHorizontal = this.ballSpeed / Math.sqrt(2);
    }

    _createModel() {
        this.ballModel = document.createElement('div');

        this.ballModel.style.cssText = `
            width: 20px;
            height: 20px;
            position: absolute;
            bottom: 50px;
            left: 50%;
            margin-left: -10px;
            background-color: #333;
            border-radius: 50%;
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
        `;

        document.body.appendChild(this.ballModel);

        return this.ballModel;
    }

    move() {
        if(!gameIsStarted) {
            this.leftPosition = parseFloat(this.playerModel.style.left) * 0.01 * document.body.clientWidth;
            this.bottomPosition = 50;
        }
        else if (gameIsStarted) {
            this.leftPosition = parseFloat(this.ballModel.style.left);
            this.bottomPosition = parseFloat(this.ballModel.style.bottom);

            this.leftPosition += this.speedHorizontal;
            this.bottomPosition += this.speedVertical;

            if (this.leftPosition > document.body.clientWidth - 10) {
                this.leftPosition = document.body.clientWidth - 10;
                this.speedHorizontal = -this.speedHorizontal;
                return;
            }
            if (this.leftPosition < 10) {
                this.leftPosition = 10;
                this.speedHorizontal = -this.speedHorizontal;
                return;
            }
            if (this.bottomPosition > document.body.clientHeight - 20) {
                this.bottomPosition = document.body.clientHeight - 20;
                this.speedVertical = -this.speedVertical;
                return;
            }
            if (this.bottomPosition < 10) {
                Util.gameOver();
                this._init();
                return;
            }

            // Pad hit
            var playerClientRect = this.playerModel.getBoundingClientRect();
            if (this.bottomPosition <= document.body.clientHeight - playerClientRect.top
                && this.leftPosition + 10 >= playerClientRect.left
                && this.leftPosition -10 <= playerClientRect.right) {
                var percentsOfPad = ((this.leftPosition - (this.playerModel.offsetLeft + this.playerModel.offsetWidth / 2)) / this.playerModel.offsetWidth) * 1.5;
                this.speedHorizontal = percentsOfPad * this.ballSpeed;
                this.speedVertical = Math.sqrt(Math.pow(this.ballSpeed, 2) - Math.pow(this.speedHorizontal, 2));
                this.bottomPosition = document.body.clientHeight - playerClientRect.top + 5;
                return;
            }

            //Brick hit
            let ballModel = this.ballModel;
            for (let i = 0; i < bricksArray.length; i++) {
                let brickModel = bricksArray[i].brickModel;
                let brickModelLeft = brickModel.offsetLeft;
                let brickModelRight = brickModel.offsetLeft + brickModel.offsetWidth;
                let brickModelTop = brickModel.offsetTop;
                let brickModelBottom = brickModel.offsetTop + brickModel.offsetWidth;
                let ballCenterLeft = ballModel.offsetLeft + ballModel.offsetWidth / 2;
                let ballCenterTop = ballModel.offsetTop + ballModel.offsetHeight / 2;
                let ballCenterOffset = ballModel.offsetWidth * Math.sqrt(2) / 4;
                if(Util.rect2rectCollision(ballModel, brickModel)) {
                    // TODO: rebuld brick collision function si it will check collisions right
                    // It should be done for each collision case (left, right, top, bottom, each corner)
                    if (ballCenterLeft + ballCenterOffset >= brickModelLeft + this.speedHorizontal * 2
                        && ballCenterLeft - ballCenterOffset <= brickModelRight + this.speedHorizontal * 2) {
                        this.speedVertical = -this.speedVertical;
                        this.bottomPosition += this.speedVertical * 2;
                        console.log('collided vertical');
                    } else if (ballCenterTop + ballCenterOffset >= brickModelTop + this.speedVertical * 2
                                && ballCenterTop - ballCenterOffset <= brickModelBottom - this.speedVertical * 2) {
                        this.speedHorizontal = -this.speedHorizontal;
                        this.leftPosition += this.speedHorizontal * 2;
                        console.log('collided horizontal');
                    } else {
                        this.speedHorizontal = -this.speedHorizontal;
                        this.speedVertical = -this.speedVertical;
                        this.leftPosition += this.speedHorizontal * 2;
                        this.bottomPosition += this.speedVertical * 2;
                        console.log('collided horizontal and vertical');
                    }

                    brickModel.style.display = 'none';
                    killedBricks++;
                    if (killedBricks >= bricksArray.length) {
                        Util.win();
                    }

                    break;
                }
            }
        }

        this.ballModel.style.left = this.leftPosition + 'px';
        this.ballModel.style.bottom = this.bottomPosition + 'px';
    }

    getModel() {
        return this.ballModel;
    }
}

class Brick {
    constructor(x, y) {
        this._createModel(x, y);
    }

    _createModel(x, y) {
        this.brickModel = document.createElement('div');
        this.brickModel.style.cssText = "\
            width: 3%;\
            height: 2%;\
            position: absolute;\
            margin-left: -10px;\
            background-color: #333;\
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
        ";
        this.brickModel.style.left =  x;
        this.brickModel.style.top =  y;

        document.body.appendChild(this.brickModel);

        return this.brickModel;
    }
}

class Levels {
    static _createLevel1() {
        this.bricksArray = [];
        let x = 0, y = '5%';
        let i = 0;
        let maxY = 35;
        while (parseFloat(y) <= maxY) {
            x = parseFloat(x) + 4 + '%';
            if (parseFloat(x) > 95) {
                x = '4%';
                y = parseFloat(y) + 3 + '%';
            }
            if (parseFloat(y) >= maxY) break;
            this.bricksArray[i] = new Brick(x, y);
            i++;
        }
        return this.bricksArray;
    }
}

class Util {
    static rect2rectCollision(obj1, obj2) {
        return (obj1.offsetLeft <= obj2.offsetLeft + obj2.offsetWidth
            && obj1.offsetLeft + obj1.offsetWidth  >=  obj2.offsetLeft
            && obj1.offsetTop + obj1.offsetHeight >=  obj2.offsetTop
            && obj1.offsetTop <= obj2.offsetTop +  obj2.offsetHeight);
    }

    static adjustPictureForGame() {
        document.body.style.cursor = 'none';
        document.querySelector('.overlay').style.display = 'none';
    }

    static gameOver() {
        let overlay = document.querySelector('.overlay');
        gameIsStarted = false;
        isLost++;
        document.body.style.cursor = '';
        overlay.querySelector('.overlay--text').innerHTML = `<span class="important-message">You lose</span><br>Click to continue<br>Click F5 to start again`;
        overlay.style.display = '';
    }

    static win() {
        let overlay = document.querySelector('.overlay');
        gameIsStarted = false;
        document.body.style.cursor = '';
        if (!isLost) overlay.querySelector('.overlay--text').innerHTML = `<span class="important-message">You win</span><br>For real<br>Click F5 to start again`;
        if (isLost) overlay.querySelector('.overlay--text').innerHTML = `<span class="important-message">You win</span><br>-ish<br>Click F5 to start again`;
        overlay.style.display = '';
    }
}
// Initialization
var gameIsStarted;
var bricksArray;
var killedBricks = 0;
var isLost = 0;

function initialize() {
    var logicCycleTime = 16;
    var player1 = new Player();
    var ball    = new Ball(player1);
    gameIsStarted = false;
    bricksArray = Levels._createLevel1();
    //var brick = new Brick(100, 100)
    document.addEventListener('keypress', function(event) {
        if (event.keyCode == 32) gameIsStarted = true;
        Util.adjustPictureForGame();
    });
    document.addEventListener('click', function() {
        gameIsStarted = true;
        Util.adjustPictureForGame();
    });
    (function() {
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    })();

    function render() {
        player1.move();
        ball.move();
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    // Main cycle
    //setInterval(function() {
    //
    //}, logicCycleTime);
}

window.onload = initialize;
