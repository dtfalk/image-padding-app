import React from 'react';
import '../../App.css';

const FileSelector = ({ saveLocation, setError, addImages }) => {
  const openMultiFileDialog = async () => {
    try {
      const result = await window.electron.openMultiFileDialog();
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

  const checkMultiFilePathExists = () => {
    if (saveLocation === 'No save location selected') {
      setError(true);
    } else {
      setError(false);
      openMultiFileDialog();
    }
  };

  return (
    <div>
      <button onClick={checkMultiFilePathExists}>Select Image(s)</button>
    </div>
  );
};

export default FileSelector;
