import PropTypes from 'prop-types';

function UploadSection({ handleFileChange, handleUpload }) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h5 m-0">Upload Image</h2>
      </div>
      <div className="card-body">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="form-control mb-3" 
        />
        <button onClick={handleUpload} className="btn btn-primary w-100">
          Upload Image
        </button>
      </div>
    </div>
  );
}

UploadSection.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  handleUpload: PropTypes.func.isRequired,
};
  
export default UploadSection;