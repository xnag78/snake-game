import React from 'react';
import SnakeGame from './components/SnakeGame';
import './styles/game.css';
import './styles/ui.css';

const App = () => {
  return (
    <div className="App">
      <SnakeGame />
    </div>
  );
}

export default App;