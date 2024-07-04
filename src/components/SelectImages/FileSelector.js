import React from 'react';
import '../../App.css';

const FileSelector = ({ sourceLocation, addImages }) => {
  const openMultiFileDialog = async () => {
    try {
      const result = await window.electron.openMultiFileDialog(sourceLocation);
      if (result && result.length > 0) {
        const validExtensions = ['jpeg', 'jpg', 'png', 'svg', 'gif', 'svg'];
        const imageFiles = result.filter(image => 
          validExtensions.some(extension => image.toLowerCase().endsWith(extension))
        );
        
        const imagePreviews = await Promise.all(imageFiles.map(async (image) => {
          const dataUrl = await window.electron.readImage(image);
          return { path: image, dataUrl };
        }));

        addImages(imagePreviews);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  return (
    <div>
      <button onClick={openMultiFileDialog}>Select Image(s)</button>
    </div>
  );
};

export default FileSelector;
