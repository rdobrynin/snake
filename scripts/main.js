//Canvas
var canvas = new Object();
canvas.element = document.getElementById('canvas');
canvas.context = canvas.element.getContext('2d');
canvas.width = canvas.element.getAttribute('width');
canvas.height = canvas.element.getAttribute('height');
canvas.cellWidth = 10;

var ctx = canvas.context;
var width = canvas.width;
var height = canvas.height;

var cw = canvas.cellWidth;
var widthInELEMENTs = width / cw;
var heightInELEMENTs = height / cw;

canvas.draw = function(x, y, fillCol, strokeColour, width, height) {
    this.context.fillStyle = fillCol;
    this.context.fillRect(x*canvas.cellWidth, y*canvas.cellWidth, width, height);
    this.context.strokeStyle = strokeColour;
    this.context.strokeRect(x*canvas.cellWidth, y*canvas.cellWidth, width, height);
    this.context.fillStyle = "Black";
    this.context.fillRect(0, 0, width, canvas.cellWidth);
    this.context.fillRect(0, height - canvas.cellWidth, width, canvas.cellWidth);
    this.context.fillRect(0, 0, canvas.cellWidth, height);
    this.context.fillRect(width - canvas.cellWidth, 0, canvas.cellWidth, height);
};

var game = new Object();
game.score = 0;
game.speed = 1;
game.frequency = 20;
game.level = "worm";
game.setScore = function() {
    document.getElementById('score').innerHTML = this.score;
};
game.updateLevel = function() {
    if(game.speed == 3) {
        game.level = "Speed Worm";
    }
    else if(game.speed > 3) {
        game.level = "Mega Worm";
    }
    document.getElementById('level').innerHTML = this.level;
};

game.setHiScore = function() {
    if (typeof localStorage !== 'undefined') {
        try {
            if (game.score > localStorage.getItem('hiScore')) {
                localStorage.setItem('hiScore', game.score);
                document.getElementById('hi_score').innerHTML = localStorage.getItem('hiScore');
            }
        } catch(e) {
        }
    } else {
    }
};
game.getHiScore = function() {
    if (typeof localStorage !== 'undefined') {
        if (localStorage.getItem('hiScore')) {
            document.getElementById('hi_score').innerHTML = localStorage.getItem('hiScore');
        }
    }
};


canvas.drawBorder = function () {
    canvas.context.fillStyle = "Black";
    canvas.context.fillRect(0, 0, width, cw);
    canvas.context.fillRect(0, height - cw, width, cw);
    canvas.context.fillRect(0, 0, cw, height);
    canvas.context.fillRect(width - cw, 0, cw, height);
};


var ELEMENT = function (col, row) {
    this.col = col;
    this.row = row;
};

ELEMENT.prototype.drawSquare = function(color, border) {
    var x = this.col * cw;
    var y = this.row * cw;
    canvas.context.fillStyle = color;
    canvas.context.fillRect(x, y, cw, cw);
    canvas.context.strokeStyle = border;
    canvas.context.strokeRect(x, y, cw, cw)
};

ELEMENT.prototype.equal = function(otherELEMENT) {
    return this.col === otherELEMENT.col && this.row === otherELEMENT.row;
};

var Snake = function () {
    // draw snake
    this.segments = [
        new ELEMENT(7, 5),
        new ELEMENT(6, 5),
        new ELEMENT(5, 5),
        new ELEMENT(4, 5),
        new ELEMENT(3, 5)
    ];
    this.direction = "right";
    this.nextDirection = "down";
};


Snake.prototype.draw = function() {
    for(var i = 0; i < this.segments.length; i++){
        this.segments[i].drawSquare("black", "#99cc99");
    }
};



Snake.prototype.move = function() {
    var head = this.segments[0];
    var newELEMENT;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
        newELEMENT = new ELEMENT(head.col + 1, head.row);
    } else if (this.direction === "down"){
        newELEMENT = new ELEMENT(head.col, head.row + 1);
    } else if(this.direction === "left"){
        newELEMENT = new ELEMENT(head.col - 1, head.row);
    } else if(this.direction === "up"){
        newELEMENT = new ELEMENT(head.col, head.row - 1);
    }
    if (this.checkConflict(newELEMENT)){
        game.gameOver();
        return;
    }
    this.segments.unshift(newELEMENT);
    if (newELEMENT.equal(food.position)) {
        game.score++;
        game.setHiScore();
        game.speed++;
        food.move();
        snake.speed();
        game.setScore();
        game.updateLevel();
        return false;
    } else{
        this.segments.pop();
    }
};

Snake.prototype.speed = function() {
    window.clearInterval(intervalId);
    var speedArg = 2000 / (game.frequency - game.speed);
    var updateInterval = setInterval(function () {
        ctx.clearRect(0, 0, width, height);
        snake.move();
        snake.draw();
        food.draw();
        canvas.drawBorder();
    }, speedArg);
};

Snake.prototype.checkConflict = function(head) {
    var leftConflict = (head.col === 0);
    var topConflict = (head.row === 0);
    var rightConflict = (head.col === widthInELEMENTs - 1);
    var bottomConflict = (head.row === heightInELEMENTs - 1);

    var wallConflict = leftConflict || topConflict || rightConflict || bottomConflict;
    var selfConflict = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfConflict = true;
        }
    }
    return wallConflict || selfConflict;
};

Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if(this.direction === "right" && newDirection === "left"){
        return;
    } else if(this.direction === "down" && newDirection === "up"){
        return;
    } else if(this.direction === "left" && newDirection === "right"){
        return;
    }
    this.nextDirection = newDirection;
};

var Food = function () {
    this.position = new ELEMENT(10, 10);
};

Food.prototype.draw = function() {
    this.position.drawSquare("black");
};

Food.prototype.move = function() {
    var randomCol = Math.floor(Math.random() * (widthInELEMENTs - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInELEMENTs - 2)) + 1;
    this.position = new ELEMENT(randomCol, randomRow);
};

// Create Objects

var snake = new Snake();
var food = new Food();
game.getHiScore();

var intervalId = setInterval(function () {
    ctx.clearRect(0, 0, width, height);
    snake.move();
    snake.draw();
    food.draw();
    canvas.drawBorder();
}, 2000 / game.frequency);


// keys
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

var flag = false;

game.gameOver = function () {
    window.clearInterval(intervalId);
    canvas.context.font = "24px Courier";
    canvas.context.fillStyle = "Black";
    canvas.context.textAlign = "center";
    canvas.context.textBaseLine = "middle";
    canvas.context.fillText("Game over", width / 2, height / 2);
    flag = true;
    game.setHiScore();
    return false;
};

// press the key
document.addEventListener('keydown', function(event) {
    if (flag === false) {
        var newDir = directions[event.keyCode];
        if (newDir !== undefined) {snake.setDirection(newDir)}
    }
}, false);


