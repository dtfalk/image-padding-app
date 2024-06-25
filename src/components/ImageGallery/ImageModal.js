// import React from 'react';
// import '../../App.css';

// const ImageModal = ({ image, onClose }) => {
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <span className="close-button" onClick={onClose}>&times;</span>
//         <img src={image.dataUrl} alt="Selected" className="modal-image" />
//       </div>
//     </div>
//   );
// };

// export default ImageModal;
import React from 'react';
import '../../App.css';

const ImageModal = ({ image, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <div className="modal-image-wrapper">
          <img src={image.dataUrl} alt="Selected" className="modal-image" />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

