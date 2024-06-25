import React from 'react';
import '../../App.css';

const ViewSelectedImagesButton = ({selectedImages, setView}) => {
  return (
    <div className="button-wrapper-selected-files">
      <p><b>{selectedImages.length} image(s) selected</b><br></br></p>
      <div className="button-container-selected-files">
        <button onClick={() => setView("selectedGallery")}>View Selected Image(s)</button>
      </div>
    </div>
  );
};

export default ViewSelectedImagesButton;
