import React, { useState } from 'react';
import '../../App.css';

const ViewSelectedImagesButton = ({selectedImages, setView}) => {
  return (
    <div className="button-wrapper-selected-files">
      <p>{selectedImages.length} image(s) selected</p>
      <div className="button-container-selected-files">
        <button onClick={() => setView("gallery")}>View Selected Image(s)</button>
      </div>
    </div>
  );
};

export default ViewSelectedImagesButton;
