import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const SnakeGame = () => {
  const gameContainer = useRef(null);
  let game;
  let cursors;
  let config;
  let snakeParts = [];
  let scoreTextRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [showGameOverUI, setShowGameOverUI] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  let speed = 150;
  let direction = 'right';
  let moveTime = 0; // Time accumulator for snake movement

  useEffect(() => {
    if (gameRunning) {
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
            this.load.image('snake', process.env.PUBLIC_URL + '/images/snake.png');
            this.load.image('food', process.env.PUBLIC_URL + '/images/food.png');
          },
          create: function() {
            let food;

            cursors = this.input.keyboard.createCursorKeys();

            for (let i = 0; i < 4; i++) {
              const part = this.physics.add.image(300 + i * 20, 300, 'snake');
              snakeParts.push(part);
            }

            food = this.physics.add.image(Phaser.Math.Between(0, 29) * 20, Phaser.Math.Between(0, 29) * 20, 'food');

            this.physics.add.collider(snakeParts);
            this.physics.add.overlap(snakeParts, food, eatFood, null, this);

            speed = 150;
            setGameOver(false);

            scoreTextRef.current = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
          },
          update: function(time, delta) {
            if (gameOver) {
              setShowGameOverUI(true);
              return;
            }

            if (time > moveTime) {
              moveSnake();
              moveTime = time + speed;
            }

            // Handle input
            if (cursors.left.isDown && direction !== 'right') {
              direction = 'left';
            } else if (cursors.right.isDown && direction !== 'left') {
              direction = 'right';
            } else if (cursors.up.isDown && direction !== 'down') {
              direction = 'up';
            } else if (cursors.down.isDown && direction !== 'up') {
              direction = 'down';
            }

            // Check for collisions with walls
            let head = snakeParts[0];
            if (head.x < 10 || head.x > this.game.config.width - 10 || head.y < 10 || head.y > this.game.config.height - 10) {
              setGameOver(true);
              setShowGameOverUI(true);
              setGameRunning(false);
            }
          }
        },
      };

      game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    }
  }, [gameRunning]);

  const moveSnake = () => {
    // Calculate new position for head
    let head = snakeParts[0];
    let newX = head.x;
    let newY = head.y;

    if (direction === 'left') {
      newX -= 20;
    } else if (direction === 'right') {
      newX += 20;
    } else if (direction === 'up') {
      newY -= 20;
    } else if (direction === 'down') {
      newY += 20;
    }

    // Move the head
    head.setPosition(newX, newY);

    // Move the body
    for (let i = snakeParts.length - 1; i > 0; i--) {
      snakeParts[i].setPosition(snakeParts[i - 1].x, snakeParts[i - 1].y);
    }
  };

  const startGame = () => {
    setGameOver(false);
    setShowGameOverUI(false);
    setGameRunning(true);
  };

  const eatFood = (snakePart, food) => {
    food.setPosition(Phaser.Math.Between(0, 28) * 20, Phaser.Math.Between(0, 28) * 20);

    const newPart = game.scene.scenes[0].physics.add.image(snakeParts[snakeParts.length - 1].x, snakeParts[snakeParts.length - 1].y, 'snake');

    snakeParts.push(newPart);

    scoreTextRef.current.setText(`Score: ${parseInt(scoreTextRef.current.text.split(' ')[1]) + 1}`);
    speed -= 5; // Increase speed by reducing the interval
  };

  const restartGame = () => {
    setGameOver(false);
    setShowGameOverUI(false);
    setGameRunning(true);
  };
  
  useEffect(() => {
    if (scoreTextRef.current) {
      scoreTextRef.current.setText('Score: 0');
    }
  }, [scoreTextRef.current]);    

  return (
    <div>
      {!gameRunning && !showGameOverUI && (
        <button onClick={startGame}>Start Game</button>
      )}
      <div ref={gameContainer}>
        {showGameOverUI && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p style={{ fontSize: '36px', color: '#ff0000' }}>Your score: {scoreTextRef.current.text.split(' ')[1]}</p>
            <button onClick={restartGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
