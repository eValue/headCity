import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './Game';



(function(){
    // fix working function for IE
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
}());

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);