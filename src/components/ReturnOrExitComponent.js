import React from 'react';
import '../App.css'

const ReturnOrExitComponent = ({ onReturn, onExit }) => {
  return (
    <div className="button-wrapper-new-or-exit">
      <p><b>Image Processing Complete</b></p>
      <p>You can either return to the home screen to select more images or exit the application.</p>
      <div className="button-container-new-or-exit">
        <button onClick={onReturn}>Return to Home</button>
        <button  onClick={onExit}>Exit Application</button>
      </div>
    </div>
  );
};

export default ReturnOrExitComponent;
