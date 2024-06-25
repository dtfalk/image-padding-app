import React from 'react';
import '../App.css'

const ReturnOrExitComponent = ({ onReturn, onExit, setView}) => {

  return (
    <div className="button-wrapper-new-or-exit">
      <p><b>Image Processing Complete</b></p>
      <div className="button-container-new-or-exit">
        <button onClick={onReturn}>Return to Home</button>
        <button  onClick={onExit}>Exit Application</button>
      </div>
      <div className="button-wrapper-selected-files">
      <div className="button-container-selected-files">
        <button onClick={() => setView("paddedGallery")}>View Padded Image(s)</button>
      </div>
    </div>
    </div>
    
  );
};

export default ReturnOrExitComponent;
