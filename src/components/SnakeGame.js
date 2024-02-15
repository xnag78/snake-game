import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const SnakeGame = () => {
  const gameContainer = useRef(null);
  let game;
  let cursors;
  let config;
  let snake;
  let scoreText;

  const [gameOver, setGameOver] = useState(false);
  const [showGameOverUI, setShowGameOverUI] = useState(false); // State for game over UI
  const [gameRunning, setGameRunning] = useState(false); // State to track if the game is running
  let speed = 150;
  let score = 0;

  useEffect(() => {
    if (gameRunning) {
      // Initialize game only if it's running
      config = {
        type: Phaser.AUTO,
        width: 600,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: {
          preload: function() {
            this.load.image('snake', 'assets/images/snake.png');
            this.load.image('food', 'assets/images/food.png');
          },
          create: function() {
            let food;

            cursors = this.input.keyboard.createCursorKeys();

            snake = this.physics.add.group({
              key: 'snake',
              repeat: 0,
              setXY: { x: 300, y: 300, stepX: 32 },
            });

            food = this.physics.add.image(Phaser.Math.Between(0, 18) * 32, Phaser.Math.Between(0, 18) * 32, 'food');

            this.physics.add.collider(snake);
            this.physics.add.overlap(snake, food, eatFood, null, this);

            score = 0;
            speed = 150;
            setGameOver(false);

            // Create score text
            scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
          },
          update: function() {
            if (gameOver) {
              setShowGameOverUI(true); // Show game over UI
              return;
            }

            let snakeHead = snake.getChildren()[0];
            if (cursors.left.isDown && snakeHead.direction !== 'right') {
              snakeHead.setVelocityX(-speed);
              snakeHead.setVelocityY(0);
              snakeHead.direction = 'left';
            } else if (cursors.right.isDown && snakeHead.direction !== 'left') {
              snakeHead.setVelocityX(speed);
              snakeHead.setVelocityY(0);
              snakeHead.direction = 'right';
            } else if (cursors.up.isDown && snakeHead.direction !== 'down') {
              snakeHead.setVelocityY(-speed);
              snakeHead.setVelocityX(0);
              snakeHead.direction = 'up';
            } else if (cursors.down.isDown && snakeHead.direction !== 'up') {
              snakeHead.setVelocityY(speed);
              snakeHead.setVelocityX(0);
              snakeHead.direction = 'down';
            }

            if (snake.getChildren().length > 0) {
              const head = snake.getChildren()[0];

              if (head.x < 0 || head.x >= this.game.config.width || head.y < 0 || head.y >= this.game.config.height) {
                setGameOver(true);
                setShowGameOverUI(true);
                setGameRunning(false);
              }
            }

            // Update score text
            scoreText.setText(`Score: ${score}`);
          }
        },
      };

      game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    }
  }, [gameRunning]);

  const startGame = () => {
    setGameOver(false);
    setShowGameOverUI(false); // Hide game over UI
    setGameRunning(true); // Start the game again
  };

  const eatFood = (snake, food) => {
    food.setPosition(Phaser.Math.Between(0, 18) * 32, Phaser.Math.Between(0, 18) * 32);

    const newPart = snake.create(snake.children.entries[snake.children.entries.length - 1].x, snake.children.entries[snake.children.entries.length - 1].y, 'snake');

    snake.add(newPart);

    score += 10;
    speed += 5;
  };

  const restartGame = () => {
    setGameOver(false);
    setShowGameOverUI(false); // Hide game over UI
    setGameRunning(true); // Start the game again
  };

  return (
    <div>
      {!gameRunning && !showGameOverUI && ( // Render start button if game is not running and game over UI is not shown
        <button onClick={startGame}>Start Game</button>
      )}
      <div ref={gameContainer}>
        {showGameOverUI && ( // Display game over UI when showGameOverUI is true
          <div className="game-over">
            <h2>Game Over!</h2>
            <p style={{ fontSize: '36px', color: '#ff0000' }}>Your score: {score}</p>
            <button onClick={restartGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
