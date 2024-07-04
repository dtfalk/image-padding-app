import React, { useState } from 'react';
import '../../App.css';

const ChangeSavePathButton = ({ setSourceLocation }) => {
  const [folderPath, setFolderPath] = useState('No save location selected');

  const openFolderDialog = async () => {
    try {
      const result = await window.electron.openFolderDialog();
      if (result && result.length > 0) {
        setFolderPath(result[0]);
        setSourceLocation(result[0]);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  };

  return (
    <div className="button-wrapper-source-location">
      <p id="save-location-text"><b>Select Source Folder</b></p>
      <div className="button-container-source-location">
        <button onClick={openFolderDialog}>Change Source Folder</button>
      </div>
    </div>
  );
};

export default ChangeSavePathButton;
