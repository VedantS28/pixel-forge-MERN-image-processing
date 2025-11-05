import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import CropTool from './CropTool';

const ASPECT_RATIOS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  'custom': 'custom',
  'free': null
};

function CropModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  initialCrop,
  onApply 
}) {
  const [cropData, setCropData] = useState(initialCrop);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('free');
  const [customRatio, setCustomRatio] = useState({ width: 16, height: 9 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [widthError, setWidthError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [lastValidCrop, setLastValidCrop] = useState(initialCrop);

  useEffect(() => {
    if (isOpen && imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        // Set initial crop to full image if not provided
        const initialData = initialCrop || {
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        setCropData(initialData);
        setLastValidCrop(initialData);
        setWidthInput(initialData.width.toString());
        setHeightInput(initialData.height.toString());
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl, initialCrop]);

  const getCurrentAspectRatio = () => {
    if (selectedAspectRatio === 'free') return null;
    if (selectedAspectRatio === 'custom') {
      return customRatio.width / customRatio.height;
    }
    return ASPECT_RATIOS[selectedAspectRatio];
  };

  const adjustCropToAspectRatio = (currentCrop, ratio) => {
    if (!ratio) return currentCrop;

    const newCrop = { ...currentCrop };
    const currentRatio = currentCrop.width / currentCrop.height;

    if (Math.abs(currentRatio - ratio) < 0.01) return currentCrop;

    // Adjust based on which dimension to prioritize
    if (currentRatio > ratio) {
      // Width is too large, adjust width
      newCrop.width = Math.round(currentCrop.height * ratio);
    } else {
      // Height is too large, adjust height
      newCrop.height = Math.round(currentCrop.width / ratio);
    }

    // Ensure we don't exceed image boundaries
    if (newCrop.x + newCrop.width > imageDimensions.width) {
      newCrop.width = imageDimensions.width - newCrop.x;
      newCrop.height = Math.round(newCrop.width / ratio);
    }
    if (newCrop.y + newCrop.height > imageDimensions.height) {
      newCrop.height = imageDimensions.height - newCrop.y;
      newCrop.width = Math.round(newCrop.height * ratio);
    }

    return newCrop;
  };

  const handleAspectRatioChange = (ratioKey) => {
    setSelectedAspectRatio(ratioKey);
    
    if (ratioKey !== 'free' && ratioKey !== 'custom') {
      const ratio = ASPECT_RATIOS[ratioKey];
      const adjustedCrop = adjustCropToAspectRatio(cropData, ratio);
      setCropData(adjustedCrop);
      setLastValidCrop(adjustedCrop);
      setWidthInput(adjustedCrop.width.toString());
      setHeightInput(adjustedCrop.height.toString());
      setWidthError('');
      setHeightError('');
    } else if (ratioKey === 'custom') {
      const ratio = customRatio.width / customRatio.height;
      const adjustedCrop = adjustCropToAspectRatio(cropData, ratio);
      setCropData(adjustedCrop);
      setLastValidCrop(adjustedCrop);
      setWidthInput(adjustedCrop.width.toString());
      setHeightInput(adjustedCrop.height.toString());
      setWidthError('');
      setHeightError('');
    }
  };

  const handleCropChange = (newCropData) => {
    setCropData(newCropData);
    setLastValidCrop(newCropData);
    setWidthInput(newCropData.width.toString());
    setHeightInput(newCropData.height.toString());
    setWidthError('');
    setHeightError('');
  };

  const validateDimension = (value, type) => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return `${type} must be greater than 0`;
    }
    
    const maxValue = type === 'Width' ? imageDimensions.width : imageDimensions.height;
    if (numValue > maxValue) {
      return `${type} cannot exceed ${maxValue}px`;
    }

    return '';
  };

  const handleWidthChange = (e) => {
    const value = e.target.value;
    setWidthInput(value);

    const error = validateDimension(value, 'Width');
    if (error) {
      setWidthError(error);
      return;
    }

    const numValue = parseInt(value);
    const ratio = getCurrentAspectRatio();

    if (ratio) {
      const calculatedHeight = Math.round(numValue / ratio);
      if (calculatedHeight > imageDimensions.height) {
        setWidthError(`Width too large for locked aspect ratio`);
        return;
      }
      
      setWidthError('');
      setHeightError('');
      const newCrop = {
        ...cropData,
        width: numValue,
        height: calculatedHeight
      };
      setCropData(newCrop);
      setLastValidCrop(newCrop);
      setHeightInput(calculatedHeight.toString());
    } else {
      setWidthError('');
      const newCrop = { ...cropData, width: numValue };
      setCropData(newCrop);
      setLastValidCrop(newCrop);
    }
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    setHeightInput(value);

    const error = validateDimension(value, 'Height');
    if (error) {
      setHeightError(error);
      return;
    }

    const numValue = parseInt(value);
    const ratio = getCurrentAspectRatio();

    if (ratio) {
      const calculatedWidth = Math.round(numValue * ratio);
      if (calculatedWidth > imageDimensions.width) {
        setHeightError(`Height too large for locked aspect ratio`);
        return;
      }
      
      setWidthError('');
      setHeightError('');
      const newCrop = {
        ...cropData,
        width: calculatedWidth,
        height: numValue
      };
      setCropData(newCrop);
      setLastValidCrop(newCrop);
      setWidthInput(calculatedWidth.toString());
    } else {
      setHeightError('');
      const newCrop = { ...cropData, height: numValue };
      setCropData(newCrop);
      setLastValidCrop(newCrop);
    }
  };

  const handleWidthBlur = () => {
    if (widthError) {
      setWidthInput(lastValidCrop.width.toString());
      setWidthError('');
    }
  };

  const handleHeightBlur = () => {
    if (heightError) {
      setHeightInput(lastValidCrop.height.toString());
      setHeightError('');
    }
  };

  const handleCustomRatioChange = (e, field) => {
    const value = parseInt(e.target.value) || 1;
    const newCustomRatio = { ...customRatio, [field]: value };
    setCustomRatio(newCustomRatio);
    
    if (selectedAspectRatio === 'custom') {
      const ratio = newCustomRatio.width / newCustomRatio.height;
      const adjustedCrop = adjustCropToAspectRatio(cropData, ratio);
      setCropData(adjustedCrop);
      setLastValidCrop(adjustedCrop);
      setWidthInput(adjustedCrop.width.toString());
      setHeightInput(adjustedCrop.height.toString());
    }
  };

  const handleApply = () => {
    if (!widthError && !heightError) {
      onApply(cropData);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Crop Image</h3>
          <button onClick={handleCancel} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.content}>
          {imageUrl && imageDimensions.width > 0 && (
            <div style={styles.cropContainer}>
              {/* Preview Section with Crop Tool */}
              <div style={styles.previewSection}>
                <CropTool
                  imageUrl={imageUrl}
                  cropData={cropData}
                  onCropChange={handleCropChange}
                  imageDimensions={imageDimensions}
                  aspectRatioLocked={getCurrentAspectRatio()}
                />
              </div>
              
              {/* Controls Section */}
              <div style={styles.controlsSection}>
                {/* Aspect Ratio Selector */}
                <div style={styles.aspectRatioSection}>
                  <label style={styles.sectionLabel}>Aspect Ratio</label>
                  <div style={styles.aspectRatioButtons}>
                    {Object.keys(ASPECT_RATIOS).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleAspectRatioChange(key)}
                        style={{
                          ...styles.aspectRatioButton,
                          ...(selectedAspectRatio === key ? styles.aspectRatioButtonActive : {})
                        }}
                      >
                        {key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Ratio Inputs */}
                  {selectedAspectRatio === 'custom' && (
                    <div style={styles.customRatioInputs}>
                      <input
                        type="number"
                        value={customRatio.width}
                        onChange={(e) => handleCustomRatioChange(e, 'width')}
                        min="1"
                        style={styles.customRatioInput}
                      />
                      <span style={styles.ratioSeparator}>:</span>
                      <input
                        type="number"
                        value={customRatio.height}
                        onChange={(e) => handleCustomRatioChange(e, 'height')}
                        min="1"
                        style={styles.customRatioInput}
                      />
                    </div>
                  )}
                </div>

                {/* Manual Dimension Inputs */}
                <div style={styles.dimensionInputsSection}>
                  <div style={styles.dimensionInputGroup}>
                    <label style={styles.inputLabel}>Width (px)</label>
                    <input
                      type="number"
                      value={widthInput}
                      onChange={handleWidthChange}
                      onBlur={handleWidthBlur}
                      min="1"
                      max={imageDimensions.width}
                      style={{
                        ...styles.dimensionInput,
                        ...(widthError ? styles.inputError : {})
                      }}
                    />
                    {widthError && <span style={styles.errorText}>{widthError}</span>}
                  </div>
                  
                  <div style={styles.dimensionInputGroup}>
                    <label style={styles.inputLabel}>Height (px)</label>
                    <input
                      type="number"
                      value={heightInput}
                      onChange={handleHeightChange}
                      onBlur={handleHeightBlur}
                      min="1"
                      max={imageDimensions.height}
                      style={{
                        ...styles.dimensionInput,
                        ...(heightError ? styles.inputError : {})
                      }}
                    />
                    {heightError && <span style={styles.errorText}>{heightError}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={handleCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleApply} style={styles.applyButton} disabled={!!(widthError || heightError)}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '95vw',
    height: '95vh',
    maxWidth: '1600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'white',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  cropContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  previewSection: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  controlsSection: {
    flexShrink: 0,
    backgroundColor: '#f8f9fa',
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '40vh',
    overflowY: 'auto',
  },
  aspectRatioSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  aspectRatioButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  aspectRatioButton: {
    padding: '6px 14px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#555',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  aspectRatioButtonActive: {
    backgroundColor: '#3674B5',
    color: 'white',
    borderColor: '#3674B5',
  },
  customRatioInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  customRatioInput: {
    width: '70px',
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  ratioSeparator: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#555',
  },
  dimensionInputsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  dimensionInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
  },
  dimensionInput: {
    padding: '8px 12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: '11px',
    color: '#dc3545',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexShrink: 0,
    backgroundColor: 'white',
  },
  cancelButton: {
    padding: '8px 20px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  applyButton: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3674B5',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

CropModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string,
  initialCrop: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  onApply: PropTypes.func.isRequired,
};

export default CropModal;
