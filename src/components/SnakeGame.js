import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const SnakeGame = () => {
  const gameContainer = useRef(null);
  const scoreTextRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [showGameOverUI, setShowGameOverUI] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [inputDirection, setInputDirection] = useState('right'); // State for directional input

  let game;
  let cursors;
  let snakeParts = [];
  const gridSize = 20; 
  let direction = 'right';
  let moveTime = 0;
  let speed = 150;

  useEffect(() => {
    if (gameRunning && !game) {
      const config = {
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
          preload: preloadScene,
          create: createScene,
          update: updateScene,
        },
        parent: gameContainer.current,
      };

      game = new Phaser.Game(config);

      return () => {
        if (game) {
          game.destroy(true);
        }
      };
    }
  }, [gameRunning]);

  useEffect(() => {
    console.log(`Direction changed to: ${inputDirection}`);
    direction = inputDirection; // Update the game direction when inputDirection changes
  }, [inputDirection]);

  const preloadScene = function () {
    this.load.image('snake', process.env.PUBLIC_URL + '/images/snake.png');
    this.load.image('food', process.env.PUBLIC_URL + '/images/food.png');
  };

  const createScene = function () {
    cursors = this.input.keyboard.createCursorKeys();

    snakeParts = [];
    for (let i = 0; i < 4; i++) {
      const part = this.physics.add.image(300 - i * (gridSize + 1), 300, 'snake');
      snakeParts.push(part);
    }

    const food = this.physics.add.image(
      Phaser.Math.Between(0, 29) * gridSize + gridSize / 2,
      Phaser.Math.Between(0, 29) * gridSize + gridSize / 2,
      'food'
    );

    this.physics.add.collider(snakeParts);
    this.physics.add.overlap(snakeParts[0], food, () => eatFood(food), null, this);

    speed = 150;
    setScore(0);
    setGameOver(false);

    scoreTextRef.current = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
  };

  const updateScene = function (time) {
    if (gameOver) {
      setShowGameOverUI(true);
      return;
    }

    if (time > moveTime) {
      moveSnake();
      moveTime = time + speed;
    }

    if (cursors.left.isDown && direction !== 'right') {
      direction = 'left';
      setInputDirection('left');
    } else if (cursors.right.isDown && direction !== 'left') {
      direction = 'right';
      setInputDirection('right');
    } else if (cursors.up.isDown && direction !== 'down') {
      direction = 'up';
      setInputDirection('up');
    } else if (cursors.down.isDown && direction !== 'up') {
      direction = 'down';
      setInputDirection('down');
    }

    checkCollisions();
  };

  const moveSnake = () => {
    const head = snakeParts[0];
    let newX = head.x;
    let newY = head.y;

    console.log(`Moving snake. Current direction: ${direction}`);

    if (direction === 'left') newX -= gridSize + 1;
    if (direction === 'right') newX += gridSize + 1;
    if (direction === 'up') newY -= gridSize + 1;
    if (direction === 'down') newY += gridSize + 1;

    for (let i = snakeParts.length - 1; i > 0; i--) {
      snakeParts[i].setPosition(snakeParts[i - 1].x, snakeParts[i - 1].y);
    }

    head.setPosition(newX, newY);
  };

  const checkCollisions = () => {
    const head = snakeParts[0];
    if (
      head.x < gridSize / 2 ||
      head.x >= 600 - gridSize / 2 ||
      head.y < gridSize / 2 ||
      head.y >= 600 - gridSize / 2 ||
      snakeParts.slice(1).some(part => part.x === head.x && part.y === head.y)
    ) {
      console.log('Collision detected. Game over.');
      setGameOver(true);
      setShowGameOverUI(true);
      setGameRunning(false);
      setInputDirection('right'); // Reset direction to default
    }
  };

  const eatFood = (food) => {
    food.setPosition(
      Phaser.Math.Between(0, 29) * gridSize + gridSize / 2,
      Phaser.Math.Between(0, 29) * gridSize + gridSize / 2
    );

    const newPart = game.scene.scenes[0].physics.add.image(
      snakeParts[snakeParts.length - 1].x,
      snakeParts[snakeParts.length - 1].y,
      'snake'
    );

    snakeParts.push(newPart);

    setScore(prevScore => {
      const newScore = prevScore + 1;
      scoreTextRef.current.setText(`Score: ${newScore}`);
      return newScore;
    });
    speed = Math.max(50, speed - 5);
  };

  const startGame = () => {
    setGameOver(false);
    setShowGameOverUI(false);
    setGameRunning(true);
    setInputDirection('right'); // Reset direction to default
  };

  const restartGame = () => {
    setGameOver(false);
    setShowGameOverUI(false);
    setGameRunning(true);
    setInputDirection('right'); // Reset direction to default
  };

  return (
    <div className="game-container">
      <div ref={gameContainer}></div>
      {!gameRunning && !showGameOverUI && (
        <button className='start-button' onClick={startGame}>Start Game</button>
      )}
      {showGameOverUI && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p style={{ fontSize: '36px', color: '#ff0000' }}>
            Your score: {score}
          </p>
          <button className='start-button' onClick={restartGame}>Restart</button>
        </div>
      )}
      {gameRunning && (
        <div className="controls">
          <button onClick={() => setInputDirection('up')}>Up</button>
          <button onClick={() => setInputDirection('left')}>Left</button>
          <button onClick={() => setInputDirection('down')}>Down</button>
          <button onClick={() => setInputDirection('right')}>Right</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
