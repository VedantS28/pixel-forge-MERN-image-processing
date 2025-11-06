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
    <div className="card bg-gradient-to-br from-blue-100 to-cyan-100 shadow-2xl border-4 border-info rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-all">
      {/* Cartoonish Header */}
      <div className="bg-gradient-to-r from-info to-primary p-4">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-2xl font-black text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Image Comparison
          </h2>
        </div>
      </div>

      <div className="card-body p-6">
        {/* Image Comparison Container */}
        <div
          className="image-comparison rounded-3xl shadow-xl border-4 border-white"
          style={{ 
            "--slider-position": `${sliderPosition}%`,
            width: containerDimensions.width > 0 ? `${containerDimensions.width}px` : "100%",
            height: containerDimensions.height > 0 ? `${containerDimensions.height}px` : "auto",
            margin: "0 auto"
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
        <div className="mt-6 p-4 bg-gradient-to-r from-success/30 to-info/30 rounded-3xl border-2 border-dashed border-success">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-primary transform hover:scale-105 transition-transform">
              <small className="text-gray-600 font-medium block">Original Size</small>
              <strong className="text-primary text-lg block">{formatFileSize(originalFileSize)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-success transform hover:scale-105 transition-transform">
              <small className="text-gray-600 font-medium block">Transformed Size</small>
              <strong className="text-success text-lg block">{formatFileSize(transformedFileSize)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-warning transform hover:scale-105 transition-transform">
              <small className="text-gray-600 font-medium block">Compression</small>
              <strong className={`text-lg block ${getCompressionPercentage() > 0 ? 'text-success' : 'text-error'}`}>
                {getCompressionPercentage() > 0 ? '-' : '+'}{Math.abs(getCompressionPercentage())}%
              </strong>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleDownload} 
            className="btn btn-success btn-lg rounded-full px-8 border-4 shadow-lg hover:scale-110 transition-transform"
            style={{ 
              boxShadow: '5px 5px 0px rgba(0,0,0,0.2)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            <span className="font-black text-lg">Download Transformed Image</span>
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