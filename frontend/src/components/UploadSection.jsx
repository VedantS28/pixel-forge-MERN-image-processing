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
    <div className="card bg-gradient-to-br from-pink-100 to-purple-100 shadow-2xl border-4 border-primary rounded-3xl transform hover:-rotate-1 transition-all hover:shadow-3xl">
      <div className="card-body p-6">
        {/* Cartoonish Header */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-black text-primary">Upload Image</h2>
        </div>

        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
          accept="image/*"
        />

        {file && (
          <div className="mb-4 p-3 bg-white rounded-2xl border-2 border-dashed border-primary">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 truncate">
                <p className="text-sm text-gray-500 font-medium">Selected File:</p>
                <p className="font-bold text-primary truncate">{file.name}</p>
              </div>
            </div>
            <button 
              onClick={handleReplaceClick} 
              className="btn btn-outline btn-secondary btn-sm w-full rounded-full border-2 hover:scale-105 transition-transform"
            >
              Replace File
            </button>
          </div>
        )}

        <button 
          onClick={handleButtonClick} 
          className="btn btn-primary w-full rounded-full text-lg font-black shadow-lg hover:scale-105 transition-transform border-4 border-primary-content"
          style={{ 
            boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
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