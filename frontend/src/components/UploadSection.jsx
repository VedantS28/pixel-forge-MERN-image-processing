import PropTypes from 'prop-types';
import { useRef } from 'react';

function UploadSection({ handleFileChange, handleUpload, file }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (file) {
      // If file is selected, upload it
      handleUpload();
    } else {
      // If no file is selected, open file picker
      fileInputRef.current?.click();
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h5 m-0">Upload Image</h2>
      </div>
      <div className="card-body">
        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          className="form-control mb-3" 
          style={{ display: 'none' }}
          accept="image/*"
        />
        {file && (
          <div className="mb-3">
            <div className="text-muted small mb-2">
              Selected: <strong>{file.name}</strong>
            </div>
            <button 
              onClick={handleReplaceClick} 
              className="btn btn-outline-secondary btn-sm w-100 mb-2"
            >
              🔄 Replace File
            </button>
          </div>
        )}
        <button onClick={handleButtonClick} className="btn btn-primary w-100">
          {file ? 'Press to Upload' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

UploadSection.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  handleUpload: PropTypes.func.isRequired,
  file: PropTypes.object,
};
  
export default UploadSection;