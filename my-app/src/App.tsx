import React from 'react';
import { colors } from './constants/colors';
import { ColorTile } from './components/ColorTile';

function App() {
  return (
    <div className="color-grid">
      {colors.map((color, index) => 
      // i could have just passed the whole object put that is a choice
        <ColorTile key={index} name={color.name} bgClass={color.bgClass} feeling={color.feeling}/>
      )}
    </div>
  );
}

export default App;
