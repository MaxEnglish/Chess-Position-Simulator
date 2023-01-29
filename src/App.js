import './App.css';
import React, {useEffect} from 'react';
import './code'
//import {setDefaultPosition} from './code'

export default function App() {

 /* useEffect(() => {
    setDefaultPosition();
  }, [])*/

  return (
    <div id="chess-board">
      {[...Array(8)].map((row, rowIndex) => (
          <div id="board-row" key={rowIndex}>
            <span className='row-label'>{8 - rowIndex}</span>
          {[...Array(8)].map((col, colIndex) => (
            <i 
            className={`board-space ${(rowIndex + colIndex) % 2 === 0 ? "light" : "dark"}`} 
            id={rowIndex + "" + colIndex} 
            key={colIndex}
            >
            </i>
          ))}
        </div>
      ))}
      <div className='col-labels'>
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>

    </div>
  );
}

