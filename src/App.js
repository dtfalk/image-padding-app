import React, { useState, useRef } from 'react';
import './App.css';
import ChangeSavePathButton from './components/HomePage/ChangeSavePathButton.js';
import FileSelector from './components/SelectImages/FileSelector.js';
import FolderSelector from './components/SelectImages/FolderSelector.js';
import ViewSelectedImagesButton from './components/SelectImages/ViewSelectedImagesButton.js';
import ImageGallery from './components/ImageGallery/ImageGallery.js';
import ReturnOrExitComponent from './components/ReturnOrExitComponent.js';

function App() {
  const [view, setView] = useState('main');
  const [saveLocation, setSaveLocation] = useState('No save location selected');
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState(false);
  const savePathRef = useRef(null);

  const handleSaveLocationChange = (newLocation) => {
    setSaveLocation(newLocation);
    setError(false); // Reset the error state when a save folder is selected
  };

  const handleContinueClick = () => {
    if (saveLocation === 'No save location selected') {
      setError(true);
    } else {
      setError(false);
      setView('selectImages');
    }
  };

  const addImages = (images) => {
    setSelectedImages(prevImages => [...prevImages, ...images]);
  };

  const removeImage = (imageToRemove) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.path !== imageToRemove.path));
  };

  const toggleImageSelection = (imagePath) => {
    setSelectedImages(prevSelectedImages =>
      prevSelectedImages.includes(imagePath)
        ? prevSelectedImages.filter(image => image !== imagePath)
        : [...prevSelectedImages, imagePath]
    );
  };

  const processImages = async () => {
    try {
      const processedImages = await window.electron.processImages(selectedImages, saveLocation);
      setView('processComplete');
    } catch (error) {
      console.error('Failed to process images:', error);
    }
  };

  const handleReturnToHome = () => {
    setView('main');
  };

  const handleExitApp = () => {
    window.electron.exitApp(); // Ensure you have an IPC handler to quit the app in your main process
  };

  return (
    <div className="App">
      {view === 'main' && (
        <>
          <ChangeSavePathButton setSaveLocation={handleSaveLocationChange} />
          <p
            id="savePath"
            ref={savePathRef}
            style={{ color: error ? 'red' : 'rgba(0, 255, 238, 0.589)', fontSize: '25px' }}
          >
            Current Save Location: {saveLocation}
          </p>
  
          <button className="continue-button" onClick={handleContinueClick}>Continue</button>
        </>
      )}
      {view === 'selectImages' && (
        <div className="button-wrapper-select">
          <p>Select the images you would like to pad</p>
          <div className="button-container-select">
            <FileSelector saveLocation={saveLocation} setError={setError} addImages={addImages} />
            <FolderSelector saveLocation={saveLocation} setError={setError} addImages={addImages} setView={setView} />
          </div>

          <ViewSelectedImagesButton selectedImages={selectedImages} setView={setView}/>

          <div style={{ marginTop: '10%' }} className="button-wrapper-select">
            <div className="button-container-select">
              <button onClick={() => setView('main')}>Back</button>
              <button onClick={processImages}>Start Image Padding Process</button>
            </div>
          </div>
        </div>
      )}
      {view === 'gallery' && (
        <div>
          <ImageGallery
            images={selectedImages}
            toggleImageSelection={toggleImageSelection}
            onBack={() => setView('selectImages')}
            removeImage={removeImage}
          />
        </div>
      )}
      {view === 'processComplete' && (
          <ReturnOrExitComponent 
          onReturn={handleReturnToHome} 
          onExit={handleExitApp} 
        />
      )}
    </div>
  );
}

export default App;
