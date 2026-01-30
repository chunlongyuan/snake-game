class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = null;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = true;

        document.getElementById('startButton').addEventListener('click', this.startGame.bind(this));
        document.addEventListener('keydown', this.changeDirection.bind(this));
    }

    startGame() {
        this.snake = [{x: 10, y: 10}];
        this.score = 0;
        this.gameOver = false;
        this.dx = this.gridSize;
        this.dy = 0;
        document.getElementById('score').textContent = `Score: ${this.score}`;
        this.generateFood();
        this.gameLoop();
    }

    generateFood() {
        // 确保食物不会在蛇身上生成
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
                y: Math.floor(Math.random() * this.tileCount) * this.gridSize
            };
        } while (this.snake.some(segment => 
            segment.x === foodPosition.x && segment.y === foodPosition.y
        ));
        this.food = foodPosition;
    }

    changeDirection(event) {
        if (this.gameOver) {
            if (event.keyCode === 13 || event.keyCode === 32) {
                this.startGame();
            }
            return;
        }

        const LEFT_KEY = 37, RIGHT_KEY = 39, UP_KEY = 38, DOWN_KEY = 40;
        switch(event.keyCode) {
            case LEFT_KEY: 
                if (this.dx === 0) { this.dx = -this.gridSize; this.dy = 0; }
                break;
            case RIGHT_KEY:
                if (this.dx === 0) { this.dx = this.gridSize; this.dy = 0; }
                break;
            case UP_KEY:
                if (this.dy === 0) { this.dx = 0; this.dy = -this.gridSize; }
                break;
            case DOWN_KEY:
                if (this.dy === 0) { this.dx = 0; this.dy = this.gridSize; }
                break;
        }
    }

    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);

        // 精确的食物吃掉检测
        if (this.checkFoodCollision()) {
            this.score++;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            this.generateFood();
            
            // 可选：随食物增加难度
            // this.increaseSpeed();
        } else {
            this.snake.pop();
        }
    }

    // 精确的食物碰撞检测
    checkFoodCollision() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }

    gameLoop() {
        if (this.gameOver) return;

        this.moveSnake();
        this.checkCollisions();
        this.draw();

        setTimeout(() => this.gameLoop(), 200);
    }

    checkCollisions() {
        const head = this.snake[0];

        // 墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver = true;
            this.endGame();
        }

        // 自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.endGame();
                break;
            }
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制食物
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);

        // 绘制蛇
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
        });
    }

    endGame() {
        alert(`Game Over! Score: ${this.score}`);
    }
}

// 初始化游戏
window.onload = () => {
    const game = new SnakeGame('gameCanvas');
};