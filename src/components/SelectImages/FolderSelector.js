import React from 'react';
import '../../App.css';

const FolderSelector = ({ saveLocation, setError, addImages, setView }) => {
  const openFolderDialog = async () => {
    try {
      const result = await window.electron.selectFolder();
      if (result && result.length > 0) {
        const folderPath = result[0];
        const folderContents = await window.electron.getImages(folderPath);
        const validExtensions = ['jpeg', 'png', 'svg'];
        const imageFiles = folderContents.filter(image => 
          validExtensions.some(extension => image.toLowerCase().endsWith(extension))
        );
        
        const imagePreviews = await Promise.all(imageFiles.map(async (image) => {
          const dataUrl = await window.electron.readImage(image);
          return { path: image, dataUrl };
        }));

        addImages(imagePreviews);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  };

  const checkFolderPathExists = () => {
    if (saveLocation === 'No save location selected') {
      setError(true);
    } else {
      setError(false);
      openFolderDialog();
    }
  };

  return (
    <div>
      <button onClick={checkFolderPathExists}>Select a Folder</button>
    </div>
  );
};

export default FolderSelector;
