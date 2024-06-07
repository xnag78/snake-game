import React from 'react';
import SnakeGame from './components/SnakeGame';
import './styles/snakeGame.css';
import './styles/snakeUI.css';

const App = () => {
  return (
    <div className="App">
      <SnakeGame />
    </div>
  );
}

export default App;