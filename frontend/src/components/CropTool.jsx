import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';

function CropTool({ imageUrl, cropData, onCropChange, imageDimensions, aspectRatioLocked }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (containerRef.current && imageDimensions.width > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Account for padding
      const availableWidth = containerWidth - 40;
      const availableHeight = containerHeight - 40;
      
      const scaleX = availableWidth / imageDimensions.width;
      const scaleY = availableHeight / imageDimensions.height;
      
      // Use the smaller scale to ensure image fits completely
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [imageDimensions]);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'move') {
      setIsDragging(true);
    } else {
      setIsResizing(type);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropData.x,
      cropY: cropData.y,
      cropWidth: cropData.width,
      cropHeight: cropData.height,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    if (isDragging) {
      // Move the crop area
      const newX = Math.max(0, Math.min(dragStart.cropX + deltaX, imageDimensions.width - cropData.width));
      const newY = Math.max(0, Math.min(dragStart.cropY + deltaY, imageDimensions.height - cropData.height));
      
      onCropChange({
        ...cropData,
        x: Math.round(newX),
        y: Math.round(newY),
      });
    } else if (isResizing) {
      // Resize the crop area
      let newCrop = { ...cropData };

      if (isResizing.includes('e')) {
        newCrop.width = Math.max(20, Math.min(dragStart.cropWidth + deltaX, imageDimensions.width - dragStart.cropX));
      }
      if (isResizing.includes('w')) {
        const maxX = dragStart.cropX + dragStart.cropWidth - 20;
        newCrop.x = Math.max(0, Math.min(dragStart.cropX + deltaX, maxX));
        newCrop.width = dragStart.cropX + dragStart.cropWidth - newCrop.x;
      }
      if (isResizing.includes('s')) {
        newCrop.height = Math.max(20, Math.min(dragStart.cropHeight + deltaY, imageDimensions.height - dragStart.cropY));
      }
      if (isResizing.includes('n')) {
        const maxY = dragStart.cropY + dragStart.cropHeight - 20;
        newCrop.y = Math.max(0, Math.min(dragStart.cropY + deltaY, maxY));
        newCrop.height = dragStart.cropY + dragStart.cropHeight - newCrop.y;
      }

      // Apply aspect ratio lock
      if (aspectRatioLocked) {
        if (isResizing.includes('e') || isResizing.includes('w')) {
          newCrop.height = Math.round(newCrop.width / aspectRatioLocked);
        } else if (isResizing.includes('n') || isResizing.includes('s')) {
          newCrop.width = Math.round(newCrop.height * aspectRatioLocked);
        }

        // Ensure we don't exceed image boundaries
        if (newCrop.x + newCrop.width > imageDimensions.width) {
          newCrop.width = imageDimensions.width - newCrop.x;
          newCrop.height = Math.round(newCrop.width / aspectRatioLocked);
        }
        if (newCrop.y + newCrop.height > imageDimensions.height) {
          newCrop.height = imageDimensions.height - newCrop.y;
          newCrop.width = Math.round(newCrop.height * aspectRatioLocked);
        }
      }

      onCropChange({
        x: Math.round(newCrop.x),
        y: Math.round(newCrop.y),
        width: Math.round(newCrop.width),
        height: Math.round(newCrop.height),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing]);

  const scaledCrop = {
    x: cropData.x * scale,
    y: cropData.y * scale,
    width: cropData.width * scale,
    height: cropData.height * scale,
  };

  return (
    <div ref={containerRef} style={styles.container}>
      <div style={{
        ...styles.imageWrapper,
        width: imageDimensions.width * scale,
        height: imageDimensions.height * scale,
      }}>
        <img src={imageUrl} alt="Crop preview" style={styles.image} />
        
        {/* Crop area with border */}
        <div
          style={{
            ...styles.cropArea,
            left: scaledCrop.x,
            top: scaledCrop.y,
            width: scaledCrop.width,
            height: scaledCrop.height,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
          {/* Grid lines */}
          <svg width="100%" height="100%" style={styles.grid}>
            <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          </svg>

          {/* Dimension display */}
          <div style={styles.dimensions}>
            {cropData.width} × {cropData.height}
          </div>

          {/* Resize handles */}
          <div style={{...styles.handle, ...styles.handleNW}} onMouseDown={(e) => handleMouseDown(e, 'nw')} />
          <div style={{...styles.handle, ...styles.handleN}} onMouseDown={(e) => handleMouseDown(e, 'n')} />
          <div style={{...styles.handle, ...styles.handleNE}} onMouseDown={(e) => handleMouseDown(e, 'ne')} />
          <div style={{...styles.handle, ...styles.handleE}} onMouseDown={(e) => handleMouseDown(e, 'e')} />
          <div style={{...styles.handle, ...styles.handleSE}} onMouseDown={(e) => handleMouseDown(e, 'se')} />
          <div style={{...styles.handle, ...styles.handleS}} onMouseDown={(e) => handleMouseDown(e, 's')} />
          <div style={{...styles.handle, ...styles.handleSW}} onMouseDown={(e) => handleMouseDown(e, 'sw')} />
          <div style={{...styles.handle, ...styles.handleW}} onMouseDown={(e) => handleMouseDown(e, 'w')} />
        </div>
        
        {/* Dark overlay outside crop area - contained within image */}
        <svg width="100%" height="100%" style={styles.overlayMask}>
          <defs>
            <mask id="cropMask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={scaledCrop.x}
                y={scaledCrop.y}
                width={scaledCrop.width}
                height={scaledCrop.height}
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#cropMask)" />
        </svg>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    userSelect: 'none',
    padding: '20px',
  },
  imageWrapper: {
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  overlayMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  cropArea: {
    position: 'absolute',
    border: '2px solid #3674B5',
    boxSizing: 'border-box',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  dimensions: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(54, 116, 181, 0.9)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  handle: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#3674B5',
    border: '2px solid white',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  handleNW: { top: '-6px', left: '-6px', cursor: 'nw-resize' },
  handleN: { top: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
  handleNE: { top: '-6px', right: '-6px', cursor: 'ne-resize' },
  handleE: { top: '50%', right: '-6px', transform: 'translateY(-50%)', cursor: 'e-resize' },
  handleSE: { bottom: '-6px', right: '-6px', cursor: 'se-resize' },
  handleS: { bottom: '-6px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
  handleSW: { bottom: '-6px', left: '-6px', cursor: 'sw-resize' },
  handleW: { top: '50%', left: '-6px', transform: 'translateY(-50%)', cursor: 'w-resize' },
};

CropTool.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  cropData: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  onCropChange: PropTypes.func.isRequired,
  imageDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  aspectRatioLocked: PropTypes.number, // Aspect ratio as a number (width/height) or null for free form
};

export default CropTool;
