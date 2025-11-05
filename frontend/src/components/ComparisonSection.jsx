import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";

function ComparisonSection({
  transformedImageUrl,
  originalImageUrl,
  sliderPosition,
  handleMouseDown,
  handleDownload,
  originalFileSize,
  transformedFileSize,
}) {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate compression percentage
  const getCompressionPercentage = () => {
    if (originalFileSize === 0 || transformedFileSize === 0) return 0;
    const reduction = ((originalFileSize - transformedFileSize) / originalFileSize) * 100;
    return Math.round(reduction);
  };

  useEffect(() => {
    if (!transformedImageUrl || !originalImageUrl) return;

    // Load original image to get its aspect ratio
    const originalImg = new Image();
    originalImg.onload = () => {
      const originalAspectRatio = originalImg.width / originalImg.height;
      
      // Fixed container size based on viewport
      const viewportMaxWidth = window.innerWidth * 0.85; // 85vw
      const viewportMaxHeight = window.innerHeight * 0.6; // 60vh
      
      let containerWidth, containerHeight;
      
      // Calculate container size maintaining original image's aspect ratio
      if (originalAspectRatio > viewportMaxWidth / viewportMaxHeight) {
        // Width-constrained
        containerWidth = viewportMaxWidth;
        containerHeight = containerWidth / originalAspectRatio;
      } else {
        // Height-constrained
        containerHeight = viewportMaxHeight;
        containerWidth = containerHeight * originalAspectRatio;
      }
      
      setContainerDimensions({
        width: containerWidth,
        height: containerHeight
      });
    };
    originalImg.src = originalImageUrl;
  }, [transformedImageUrl, originalImageUrl]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white">
        <h2 className="h5 m-0">Image Comparison</h2>
      </div>
      <div className="card-body text-center">
        <div
          className="image-comparison"
          style={{ 
            "--slider-position": `${sliderPosition}%`,
            width: containerDimensions.width > 0 ? `${containerDimensions.width}px` : "100%",
            height: containerDimensions.height > 0 ? `${containerDimensions.height}px` : "auto",
            margin: "0 auto" // Center the container
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown} 
          ref={imageRef}
        >
          <img
            src={transformedImageUrl}
            alt="Transformed"
            className="transformed-image"
            style={{ objectFit: "contain" }}
          />
          <img
            src={originalImageUrl}
            alt="Original"
            className="original-image"
            style={{ objectFit: "contain" }}
          />
          <div className="comparison-slider"></div>
        </div>

        {/* File Size Information */}
        <div className="mt-3 p-3 bg-light rounded">
          <div className="row text-center">
            <div className="col-md-4">
              <small className="text-muted d-block">Original Size</small>
              <strong className="text-primary">{formatFileSize(originalFileSize)}</strong>
            </div>
            <div className="col-md-4">
              <small className="text-muted d-block">Transformed Size</small>
              <strong className="text-success">{formatFileSize(transformedFileSize)}</strong>
            </div>
            <div className="col-md-4">
              <small className="text-muted d-block">Compression</small>
              <strong className={getCompressionPercentage() > 0 ? 'text-success' : 'text-danger'}>
                {getCompressionPercentage() > 0 ? '-' : '+'}{Math.abs(getCompressionPercentage())}%
              </strong>
            </div>
          </div>
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
  originalFileSize: PropTypes.number,
  transformedFileSize: PropTypes.number,
};

export default ComparisonSection;