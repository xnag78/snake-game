import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const SnakeGame = () => {
  const gameContainer = useRef(null);
  let game;
  let cursors;
  let config;
  let snakeParts = []; // Array to hold snake parts
  let scoreTextRef = useRef(null); // Create a ref for the score text

  const [gameOver, setGameOver] = useState(false);
  const [showGameOverUI, setShowGameOverUI] = useState(false); // State for game over UI
  const [gameRunning, setGameRunning] = useState(false); // State to track if the game is running
  let speed = 150;

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
            this.load.image('snake', process.env.PUBLIC_URL + '/images/snake.png'); // 20x20px
            this.load.image('food', process.env.PUBLIC_URL + '/images/food.png'); // 20x20px
          },
          create: function() {
            let food;

            cursors = this.input.keyboard.createCursorKeys();

            // Initialize snakeParts array with 4 parts spaced apart nicely
            for (let i = 0; i < 4; i++) {
              const part = this.physics.add.image(300 + i * 21, 300, 'snake');  // using 21 instead of 20 is for the 1px gap
              part.direction = 'none'; // Set initial direction to none
              part.setVelocity(0, 0); // Set initial velocity to 0
              snakeParts.push(part);
            }

            food = this.physics.add.image(Phaser.Math.Between(0, 18) * 20, Phaser.Math.Between(0, 18) * 20, 'food');

            this.physics.add.collider(snakeParts);
            this.physics.add.overlap(snakeParts, food, eatFood, null, this);

            speed = 150;
            setGameOver(false);

            // Create score text
            scoreTextRef.current = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
          },
          update: function() {
            if (gameOver) {
              setShowGameOverUI(true); // Show game over UI
              return;
            }

            let snakeHead = snakeParts[0];
            snakeHead.setVelocity(0, 0); // Reset velocity to 0 before checking input
            if (cursors.left.isDown && snakeHead.direction !== 'right') {
              snakeHead.setVelocity(-speed, 0);
              snakeHead.direction = 'left';
            } else if (cursors.right.isDown && snakeHead.direction !== 'left') {
              snakeHead.setVelocity(speed, 0);
              snakeHead.direction = 'right';
            } else if (cursors.up.isDown && snakeHead.direction !== 'down') {
              snakeHead.setVelocity(0, -speed);
              snakeHead.direction = 'up';
            } else if (cursors.down.isDown && snakeHead.direction !== 'up') {
              snakeHead.setVelocity(0, speed);
              snakeHead.direction = 'down';
            }

            // // Create a new snake part at the head position
            // let newPart = game.scene.scenes[0].physics.add.image(snakeHead.x, snakeHead.y, 'snake');
            // newPart.direction = snakeHead.direction;
            // newPart.setVelocity(snakeHead.body.velocity.x, snakeHead.body.velocity.y); // Set velocity

            // // Adjust position based on direction of movement
            // if (snakeHead.direction === 'left') {
            //   newPart.x -= 20; // Adjust x position to the left
            // } else if (snakeHead.direction === 'right') {
            //   newPart.x += 20; // Adjust x position to the right
            // } else if (snakeHead.direction === 'up') {
            //   newPart.y -= 20; // Adjust y position upwards
            // } else if (snakeHead.direction === 'down') {
            //   newPart.y += 20; // Adjust y position downwards
            // }

            // // Add the new part at the front of the snakeParts array
            // snakeParts.unshift(newPart);

            // // Remove the tail if the snake has moved
            // if (snakeParts.length > 0) {
            //   let tail = snakeParts.pop();
            //   tail.destroy();
            // }
          
            if (snakeParts.length > 0) {
              const head = snakeParts[0];
          
              if (head.x < 0 || head.x >= this.game.config.width || head.y < 0 || head.y >= this.game.config.height) {
                setGameOver(true);
                setShowGameOverUI(true);
                setGameRunning(false);
              }
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

  const startGame = () => {
    setGameOver(false);
    setShowGameOverUI(false); // Hide game over UI
    setGameRunning(true); // Start the game again
  };

  const eatFood = (snakePart, food) => {
    food.setPosition(Phaser.Math.Between(0, 18) * 20, Phaser.Math.Between(0, 18) * 20);

    const newPart = game.scene.scenes[0].physics.add.image(snakeParts[snakeParts.length - 1].x, snakeParts[snakeParts.length - 1].y, 'snake');

    snakeParts.push(newPart);

    scoreTextRef.current.setText(`Score: ${parseInt(scoreTextRef.current.text.split(' ')[1]) + 1}`);
    speed += 5;
  };

  const restartGame = () => {
    setGameOver(false);
    setShowGameOverUI(false); // Hide game over UI
    setGameRunning(true); // Start the game again
  };
  
  useEffect(() => {
    if (scoreTextRef.current) {
      scoreTextRef.current.setText('Score: 0'); // Reset the score text
    }
  }, [scoreTextRef.current]);    

  return (
    <div>
      {!gameRunning && !showGameOverUI && ( // Render start button if game is not running and game over UI is not shown
        <button onClick={startGame}>Start Game</button>
      )}
      <div ref={gameContainer}>
        {showGameOverUI && ( // Display game over UI when showGameOverUI is true
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
