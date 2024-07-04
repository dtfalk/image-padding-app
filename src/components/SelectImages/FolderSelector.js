import React from 'react';
import '../../App.css';

const FolderSelector = ({ sourceLocation, addImages}) => {
  const handleButton = async () => {
    try {
        const folderPath = sourceLocation;
        const folderContents = await window.electron.getImages(folderPath);
        const validExtensions = ['jpeg', 'jpg', 'png', 'svg', 'gif', 'svg'];
        const imageFiles = folderContents.filter(image => 
          validExtensions.some(extension => image.toLowerCase().endsWith(extension))
        );
        
        const imagePreviews = await Promise.all(imageFiles.map(async (image) => {
          const dataUrl = await window.electron.readImage(image);
          return { path: image, dataUrl };
        }));

        addImages(imagePreviews);
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  };

  return (
    <div>
      <button onClick={handleButton}>Use Entire Folder</button>
    </div>
  );
};

export default FolderSelector;
