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
        this.gameOver = true;  // 默认为游戏未开始状态
        this.touchStartX = 0;
        this.touchStartY = 0;

        // 游戏速度控制
        this.baseSpeed = 300;  // 更慢的初始速度
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

    startGame() {
        if (!this.gameOver) return;  // 防止重复开始

        // 重置游戏状态
        this.snake = [{x: 10, y: 10}];
        this.score = 0;
        this.gameOver = false;
        this.dx = this.gridSize;  // 默认向右移动
        this.dy = 0;
        this.currentSpeed = this.baseSpeed;
        
        // 生成第一个食物
        this.generateFood();
        
        // 更新分数显示
        document.getElementById('score').textContent = `Score: ${this.score}`;
        
        // 开始游戏循环
        this.gameLoop();
    }

    generateFood() {
        let newFood;
        let collision;
        do {
            collision = false;
            newFood = {
                x: Math.floor(Math.random() * this.tileCount) * this.gridSize,
                y: Math.floor(Math.random() * this.tileCount) * this.gridSize
            };

            // 检查食物是否与蛇身重叠
            for (let segment of this.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    collision = true;
                    break;
                }
            }
        } while (collision);

        this.food = newFood;
    }

    handleTouchStart(event) {
        event.preventDefault();
        if (this.gameOver) {
            this.startGame();
            return;
        }
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (this.gameOver || !this.touchStartX || !this.touchStartY) return;

        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const diffX = touchEndX - this.touchStartX;
        const diffY = touchEndY - this.touchStartY;

        // 根据滑动方向改变蛇的方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            diffX > 0 ? this.moveRight() : this.moveLeft();
        } else {
            // 垂直滑动
            diffY > 0 ? this.moveDown() : this.moveUp();
        }

        // 重置触摸起始点
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    moveLeft() {
        if (this.dx === 0) {
            this.dx = -this.gridSize;
            this.dy = 0;
        }
    }

    moveRight() {
        if (this.dx === 0) {
            this.dx = this.gridSize;
            this.dy = 0;
        }
    }

    moveUp() {
        if (this.dy === 0) {
            this.dx = 0;
            this.dy = -this.gridSize;
        }
    }

    moveDown() {
        if (this.dy === 0) {
            this.dx = 0;
            this.dy = this.gridSize;
        }
    }

    changeDirection(event) {
        if (this.gameOver) {
            if (event.keyCode === 13 || event.keyCode === 32) {  // Enter or Space
                this.startGame();
            }
            return;
        }

        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const keyPressed = event.keyCode;
        switch(keyPressed) {
            case LEFT_KEY:
                this.moveLeft();
                break;
            case UP_KEY:
                this.moveUp();
                break;
            case RIGHT_KEY:
                this.moveRight();
                break;
            case DOWN_KEY:
                this.moveDown();
                break;
        }
    }

    gameLoop() {
        if (this.gameOver) return;

        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
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
        if (!this.food) return;
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);
        this.ctx.shadowBlur = 0;
    }

    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);

        // 检查是否吃到食物
        if (this.food && this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
            this.score++;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            
            // 生成新的食物
            this.generateFood();

            // 加速
            if (this.score % 5 === 0) {
                this.currentSpeed = Math.max(100, this.currentSpeed - 20);
            }

            // 庆祝特效
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            // 如果没吃到食物，移除尾部
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

        // 墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver = true;
            this.showGameOverEffect();
            return;
        }

        // 自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.showGameOverEffect();
                return;
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