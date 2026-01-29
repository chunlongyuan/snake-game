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
        this.touchStartX = 0;
        this.touchStartY = 0;

        // 游戏速度控制
        this.baseSpeed = 250;  // 初始速度更慢
        this.speedIncreaseThreshold = 5;  // 每增加5分增加速度
        this.currentSpeed = this.baseSpeed;

        // 禁用浏览器默认触摸行为
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        this.canvas.style.touchAction = 'none';

        // 阻止默认触摸滑动和缩放
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // 键盘控制
        document.addEventListener('keydown', this.changeDirection.bind(this));
        
        // 触摸控制
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        
        // 移动端友好的开始按钮
        document.getElementById('startButton').addEventListener('click', this.startGame.bind(this));
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (!this.touchStartX || !this.touchStartY) {
            return;
        }

        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const diffX = touchEndX - this.touchStartX;
        const diffY = touchEndY - this.touchStartY;

        // 计算角度和方向
        const angle = Math.abs(Math.atan2(diffY, diffX) * 180 / Math.PI);

        // 根据角度判断滑动方向
        if (angle > 45 && angle < 135) {
            // 垂直方向
            diffY > 0 ? this.moveDown() : this.moveUp();
        } else {
            // 水平方向
            diffX > 0 ? this.moveRight() : this.moveLeft();
        }

        // 重置触摸起始点
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    moveLeft() {
        if (this.dx !== this.gridSize) {
            this.dx = -this.gridSize;
            this.dy = 0;
        }
    }

    moveRight() {
        if (this.dx !== -this.gridSize) {
            this.dx = this.gridSize;
            this.dy = 0;
        }
    }

    moveUp() {
        if (this.dy !== this.gridSize) {
            this.dx = 0;
            this.dy = -this.gridSize;
        }
    }

    moveDown() {
        if (this.dy !== -this.gridSize) {
            this.dx = 0;
            this.dy = this.gridSize;
        }
    }

    startGame() {
        if (this.gameOver) {
            this.resetGame();
        }
        // 初始方向和速度
        this.dx = this.gridSize;
        this.dy = 0;
        this.currentSpeed = this.baseSpeed;
        this.gameLoop();
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.score = 0;
        document.getElementById('score').textContent = `Score: ${this.score}`;
        this.gameOver = false;
        this.dx = 0;
        this.dy = 0;
        this.currentSpeed = this.baseSpeed;
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
                y: Math.floor(Math.random() * this.tileCount) * this.gridSize
            };
        } while (this.snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        ));
        return newFood;
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
        }, this.currentSpeed);
    }

    clearCanvas() {
        this.ctx.fillStyle = 'rgba(41, 128, 185, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawFood() {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);
        this.ctx.shadowBlur = 0;
    }

    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);

        if (this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.score += 1;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            this.food = this.generateFood();
            
            // 根据分数动态调整速度
            if (this.score % this.speedIncreaseThreshold === 0) {
                this.currentSpeed = Math.max(50, this.currentSpeed - 20);  // 速度逐渐加快，但不低于50ms
            }
            
            // 吃到食物时的庆祝效果
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            this.snake.pop();
        }
    }

    drawSnake() {
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.shadowColor = 'rgba(46, 204, 113, 0.5)';
        this.ctx.shadowBlur = 10;
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
        });
        this.ctx.shadowBlur = 0;
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver = true;
            this.showGameOverEffect();
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.showGameOverEffect();
            }
        }
    }

    showGameOverEffect() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        alert(`Game Over! Your score: ${this.score}`);
    }
}

// 初始化游戏
window.onload = () => {
    const game = new SnakeGame('gameCanvas');
};