import React, { useState } from 'react';
import '../../App.css';

const ChangeSavePathButton = ({ setSaveLocation }) => {
  const [folderPath, setFolderPath] = useState('No save location selected');

  const openFolderDialog = async () => {
    try {
      const result = await window.electron.openFolderDialog();
      if (result && result.length > 0) {
        setFolderPath(result[0]);
        setSaveLocation(result[0]);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  };

  return (
    <div className="button-wrapper-save-location">
      <p id="save-location-text"><b>Select where to save your images</b></p>
      <div className="button-container-save-location">
        <button onClick={openFolderDialog}>Select Save Folder</button>
      </div>
    </div>
  );
};

export default ChangeSavePathButton;
