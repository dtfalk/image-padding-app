import React, { useState } from 'react';
import '../../App.css';
import ImageModal from './ImageModal.js';

const ImageGallery = ({ images, toggleImageSelection, onBack, removeImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="image-gallery">
      <button className="back-button" onClick={onBack}>Back</button>
      <div className="images-container">
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img src={image.dataUrl} alt={`Image ${index}`} className="image-item" onDoubleClick={() => handleImageClick(image)} />
            <button className="remove-button" onClick={() => removeImage(image)}>Remove</button>
          </div>
        ))}
      </div>
      {selectedImage && <ImageModal image={selectedImage} onClose={handleCloseModal} />}
    </div>
  );
};

export default ImageGallery;
