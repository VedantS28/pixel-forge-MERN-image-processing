import PropTypes from "prop-types";

function ComparisonSection({
  transformedImageUrl,
  originalImageUrl,
  sliderPosition,
  handleMouseDown,
  handleDownload,
}) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white">
        <h2 className="h5 m-0">Image Comparison</h2>
      </div>
      <div className="card-body text-center">
        <div
          className="image-comparison"
          style={{ "--slider-position": `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown} 
        >
          <img
            src={transformedImageUrl}
            alt="Transformed"
            className="transformed-image"
          />
          <img
            src={originalImageUrl}
            alt="Original"
            className="original-image"
          />
          <div className="comparison-slider"></div>
        </div>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <button onClick={handleDownload} className="btn btn-primary">
            Download Transformed Image
          </button>
        </div>
      </div>
    </div>
  );
}

ComparisonSection.propTypes = {
  transformedImageUrl: PropTypes.string,
  originalImageUrl: PropTypes.string,
  sliderPosition: PropTypes.number,
  handleMouseDown: PropTypes.func,
  handleDownload: PropTypes.func, 
};

export default ComparisonSection;
