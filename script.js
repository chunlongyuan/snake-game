class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;

        document.addEventListener('keydown', this.changeDirection.bind(this));
        document.getElementById('startButton').addEventListener('click', this.startGame.bind(this));
    }

    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        this.dx = this.gridSize;
        this.dy = 0;
        this.gameLoop();
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.gameOver = false;
        this.dx = 0;
        this.dy = 0;
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
            y: Math.floor(Math.random() * this.tileCount) * this.gridSize
        };
    }

    changeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const keyPressed = event.keyCode;
        const goingUp = this.dy === -this.gridSize;
        const goingDown = this.dy === this.gridSize;
        const goingRight = this.dx === this.gridSize;
        const goingLeft = this.dx === -this.gridSize;

        if (keyPressed === LEFT_KEY && !goingRight) {
            this.dx = -this.gridSize;
            this.dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            this.dx = 0;
            this.dy = -this.gridSize;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            this.dx = this.gridSize;
            this.dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            this.dx = 0;
            this.dy = this.gridSize;
        }
    }

    gameLoop() {
        if (this.gameOver) return;

        setTimeout(() => {
            this.clearCanvas();
            this.drawFood();
            this.moveSnake();
            this.drawSnake();
            this.checkCollision();
            this.gameLoop();
        }, 100);
    }

    clearCanvas() {
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawFood() {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);
    }

    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);

        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.score += 1;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    drawSnake() {
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
        });
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver = true;
            alert('Game Over! Your score: ' + this.score);
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                alert('Game Over! Your score: ' + this.score);
            }
        }
    }
}

// Initialize the game when the page loads
window.onload = () => {
    const game = new SnakeGame('gameCanvas');
};