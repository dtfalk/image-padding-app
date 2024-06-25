import React, { useState, useRef } from 'react';
import './App.css';
import ChangeSavePathButton from './components/HomePage/ChangeSavePathButton.js';
import FileSelector from './components/SelectImages/FileSelector.js';
import FolderSelector from './components/SelectImages/FolderSelector.js';
import ViewSelectedImagesButton from './components/SelectImages/ViewSelectedImagesButton.js';
import ImageGallery from './components/ImageGallery/ImageGallery.js';
import ReturnOrExitComponent from './components/ReturnOrExitComponent.js';

function App() {

  // set our various setters etc...
  const [view, setView] = useState('main');
  const [saveLocation, setSaveLocation] = useState('No save location selected');
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState(false);
  const savePathRef = useRef(null);

  // handler for the first view's save location 
  const handleSaveLocationChange = (newLocation) => {
    setSaveLocation(newLocation);
    setError(false); // Reset the error state when a save folder is selected
  };

  // handler for first view's continue button
  const handleContinueClick = () => {
    if (saveLocation === 'No save location selected') {
      setError(true);
    } else {
      setError(false);
      setView('selectImages');
    }
  };

  // helper function to add images to the selected images (filters out already added images)
  const addImages = (images) => {
    setSelectedImages(prevImages => {
      const prevPaths = prevImages.map(image => image.path);
      const newImages = images.filter(image => ! prevPaths.includes(image.path));
      return [...prevImages, ...newImages];
    })
  };

  // remove images from the selected images
  const removeImage = (imageToRemove) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.path !== imageToRemove.path));
  };

  // remove duplicate images
  const toggleImageSelection = (imagePath) => {
    setSelectedImages(prevSelectedImages =>
      prevSelectedImages.includes(imagePath)
        ? prevSelectedImages.filter(image => image !== imagePath)
        : [...prevSelectedImages, imagePath]
    );
  };

  // pad the images
  const processImages = async () => {
    try {
      await window.electron.processImages(selectedImages, saveLocation);
      setView('processComplete');
    } catch (error) {
      console.error('Failed to process images:', error);
    }
  };

  // set view to the initial screen
  const handleReturnToHome = () => {
    setSelectedImages([]);
    setView('main');
  };

  // handle exiting the app
  const handleExitApp = () => {
    window.electron.exitApp(); // Ensure you have an IPC handler to quit the app in your main process
  };

  // return the html divided by the various views
  return (
    <div className="App">



      {view === 'main' && (
        <>
          <ChangeSavePathButton setSaveLocation={handleSaveLocationChange} />
          <p
            id="savePath"
            ref={savePathRef}
            style={{ color: error ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.589)', fontSize: '25px' }}
          >
            <br></br><b>Current Save Location:</b> <br></br> {saveLocation}
          </p>
  
          <button className="continue-button" onClick={handleContinueClick}>Continue</button>
        </>
      )}



      {view === 'selectImages' && (
        <div className="button-wrapper-select">
          <p><b>Select the images you would like to pad</b></p>
          <div className="button-container-select">
            <FileSelector saveLocation={saveLocation} setError={setError} addImages={addImages} />
            <FolderSelector saveLocation={saveLocation} setError={setError} addImages={addImages} setView={setView} />
          </div>

          <ViewSelectedImagesButton selectedImages={selectedImages} setView={setView}/>

          <div style={{ marginTop: '10%' }} className="button-wrapper-select">
            <div className="button-container-select">
              <button onClick={() => setView('main')}>Back</button>
              <button onClick={processImages}>Pad Images</button>
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
