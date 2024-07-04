import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ChangeSavePathButton from './components/HomePage/ChangeSavePathButton.js';
import FileSelector from './components/SelectImages/FileSelector.js';
import FolderSelector from './components/SelectImages/FolderSelector.js';
import ChangeLoadPathButton from './components/SelectImages/ChangeLoadPathButton.js';
import ViewSelectedImagesButton from './components/SelectImages/ViewSelectedImagesButton.js';
import ImageGallery from './components/ImageGallery/ImageGallery.js';
import ReturnOrExitComponent from './components/ReturnOrExitComponent.js';

function App() {
  const [view, setView] = useState('main');
  const [saveLocation, setSaveLocation] = useState('No destination location selected');
  const [sourceLocation, setSourceLocation] = useState('No source location selected');
  const [selectedImages, setSelectedImages] = useState([]);
  const [paddedImages, setPaddedImages] = useState([]);
  const [error, setError] = useState(false);
  const savePathRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await window.electron.invoke('load-JSON');
        if (data.sourcePath) setSourceLocation(data.sourcePath);
        if (data.destinationPath) setSaveLocation(data.destinationPath);
      } catch (error) {
        console.error('Error loading JSON:', error);
      }
    };
    loadData();
  }, []);

  const handleSaveLocationChange = (newLocation) => {
    setSaveLocation(newLocation);
    const newData = {
      sourcePath: sourceLocation,
      destinationPath: newLocation,
    };

    window.electron.invoke('save-JSON', newData)
      .then(() => setError(false))
      .catch(err => console.error('Error updating JSON:', err));
  };

  const handleSourceLocationChange = (newLocation) => {
    setSourceLocation(newLocation);
    const newData = {
      sourcePath: newLocation,
      destinationPath: saveLocation,
    };

    window.electron.invoke('save-JSON', newData)
      .then(() => setError(false))
      .catch(err => console.error('Error updating JSON:', err));
  };

  const handleContinueClick = () => {
    if (saveLocation === 'No destination location selected') {
      setError(true);
    } else {
      setError(false);
      setView('selectImages');
    }
  };

  const getImagePreviews = async (imageFiles) => {
    var imagePreviews = await Promise.all(imageFiles.map(async (image) => {
      const dataUrl = await window.electron.readImage(image);
      return { path: image, dataUrl };
    }));
    return imagePreviews;
  };

  const addImages = (images) => {
    setSelectedImages(prevImages => {
      const prevPaths = prevImages.map(image => image.path);
      const newImages = images.filter(image => !prevPaths.includes(image.path));
      return [...prevImages, ...newImages].slice(0, 1000);
    });
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
      setPaddedImages(await (getImagePreviews(await window.electron.processImages(selectedImages, saveLocation))));
      setView('processComplete');
    } catch (error) {
      console.error('Failed to process images:', error);
    }
  };

  const handleReturnToHome = () => {
    setSelectedImages([]);
    setView('main');
  };

  const handleExitApp = () => {
    window.electron.exitApp();
  };

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
            <br /><b>Current Destination Location:</b> <br /> {saveLocation}
          </p>

          <button className="continue-button" onClick={handleExitApp}>Exit</button>
          <button className="continue-button" onClick={handleContinueClick}>Continue</button>
        </>
      )}

      {view === 'selectImages' && (
        <div className="button-wrapper-select">
          <ChangeLoadPathButton setSourceLocation={handleSourceLocationChange}/>
          <p
            id="loadPath"
            ref={savePathRef}
            style={{ color: error ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.589)', fontSize: '20px' }}
          >
            <br /><b>Current Source Location:</b> <br /> {sourceLocation}
          </p>

          <p><b>Select the images you would like to pad</b></p>
          
          <div className="button-container-select">
            <FileSelector sourceLocation={sourceLocation} addImages={addImages} />
            <FolderSelector sourceLocation= {sourceLocation} addImages={addImages} setView={setView} />
          </div>

          <ViewSelectedImagesButton selectedImages={selectedImages} setView={setView} />

          <div style={{ marginTop: '5%' }} className="button-wrapper-select">
            <div className="button-container-select">
              <button onClick={() => setView('main')}>Back</button>
              <button onClick={processImages}>Pad Images</button>
            </div>
          </div>
        </div>
      )}

      {view === 'selectedGallery' && (
        <div>
          <ImageGallery
            images={selectedImages}
            toggleImageSelection={toggleImageSelection}
            onBack={() => setView('selectImages')}
            removeImage={removeImage}
            view={view}
          />
        </div>
      )}

      {view === 'paddedGallery' && (
        <div>
          <ImageGallery
            images={paddedImages}
            toggleImageSelection={toggleImageSelection}
            onBack={() => setView('processComplete')}
            removeImage={removeImage}
            view={view}
          />
        </div>
      )}

      {view === 'processComplete' && (
        <ReturnOrExitComponent
          onReturn={handleReturnToHome}
          onExit={handleExitApp}
          setView={setView}
        />
      )}
    </div>
  );
}

export default App;
