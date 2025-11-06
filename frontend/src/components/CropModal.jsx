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
          <button onClick={handleCancel} style={styles.closeButton}>×</button>
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
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'linear-gradient(135deg, #FFF5E4, #FFEBF0)',
    borderRadius: '30px',
    width: '95vw',
    height: '95vh',
    maxWidth: '1600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 6px #FF6B9D',
    overflow: 'hidden',
    border: '6px solid white',
  },
  header: {
    padding: '20px 30px',
    borderBottom: '4px solid #FF6B9D',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    background: 'linear-gradient(90deg, #FF6B9D, #FFA07A)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '900',
    color: 'white',
    textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
    fontFamily: "'Comic Sans MS', cursive",
  },
  closeButton: {
    background: 'white',
    border: '3px solid #FF6B9D',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#FF6B9D',
    padding: '4px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
    fontWeight: 'bold',
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
    background: 'linear-gradient(135deg, #f0f0f0 25%, transparent 25%) -10px 0, linear-gradient(225deg, #f0f0f0 25%, transparent 25%) -10px 0, linear-gradient(315deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%)',
    backgroundSize: '20px 20px',
    backgroundColor: '#e8e8e8',
  },
  controlsSection: {
    flexShrink: 0,
    background: 'linear-gradient(180deg, #FFF9E6, #FFE6F0)',
    padding: '20px 30px',
    borderTop: '4px dashed #FFA07A',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '40vh',
    overflowY: 'auto',
  },
  aspectRatioSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionLabel: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#C44569',
    fontFamily: "'Comic Sans MS', cursive",
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  },
  aspectRatioButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  aspectRatioButton: {
    padding: '10px 18px',
    border: '3px solid #FFA07A',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#C44569',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
    fontFamily: "'Comic Sans MS', cursive",
  },
  aspectRatioButtonActive: {
    background: 'linear-gradient(135deg, #FF6B9D, #FFA07A)',
    color: 'white',
    borderColor: '#FF6B9D',
    transform: 'translateY(-2px)',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
  },
  customRatioInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  customRatioInput: {
    width: '80px',
    padding: '10px 14px',
    border: '3px solid #FFA07A',
    borderRadius: '15px',
    fontSize: '16px',
    outline: 'none',
    fontWeight: '700',
    textAlign: 'center',
  },
  ratioSeparator: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#FF6B9D',
  },
  dimensionInputsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  dimensionInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#C44569',
    fontFamily: "'Comic Sans MS', cursive",
  },
  dimensionInput: {
    padding: '12px 16px',
    border: '3px solid #55E6C1',
    borderRadius: '15px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    fontWeight: '600',
    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
  },
  inputError: {
    borderColor: '#FF6B9D',
    boxShadow: '0 0 10px rgba(255,107,157,0.5)',
  },
  errorText: {
    fontSize: '12px',
    color: '#FF6B9D',
    fontWeight: '600',
  },
  footer: {
    padding: '20px 30px',
    borderTop: '4px solid #FFD93D',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    flexShrink: 0,
    background: 'linear-gradient(90deg, #FFE6F0, #FFF9E6)',
  },
  cancelButton: {
    padding: '12px 28px',
    border: '3px solid #C44569',
    borderRadius: '25px',
    backgroundColor: 'white',
    color: '#C44569',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    fontFamily: "'Comic Sans MS', cursive",
  },
  applyButton: {
    padding: '12px 28px',
    border: '3px solid #55E6C1',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #55E6C1, #74B9FF)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
    fontFamily: "'Comic Sans MS', cursive",
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
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
