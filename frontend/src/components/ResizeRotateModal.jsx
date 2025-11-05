import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const RESIZE_PRESETS = {
  '1920x1080': { width: 1920, height: 1080 },
  '1280x720': { width: 1280, height: 720 },
  '800x600': { width: 800, height: 600 },
  'custom': null,
};

function ResizeRotateModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  initialResize,
  initialRotate,
  imageDimensions,
  onApply 
}) {
  const [resizeData, setResizeData] = useState(initialResize || { width: 0, height: 0 });
  const [rotateAngle, setRotateAngle] = useState(initialRotate || 0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [angleInput, setAngleInput] = useState('0');
  const [widthError, setWidthError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [lastValidResize, setLastValidResize] = useState(initialResize || { width: 0, height: 0 });
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  useEffect(() => {
    if (isOpen && imageDimensions.width > 0) {
      const ratio = imageDimensions.width / imageDimensions.height;
      setOriginalAspectRatio(ratio);
      
      const initialData = initialResize || {
        width: imageDimensions.width,
        height: imageDimensions.height
      };
      setResizeData(initialData);
      setLastValidResize(initialData);
      setWidthInput(initialData.width.toString());
      setHeightInput(initialData.height.toString());
      setRotateAngle(initialRotate || 0);
      setAngleInput((initialRotate || 0).toString());
    }
  }, [isOpen, imageDimensions, initialResize, initialRotate]);

  const getMaxDimension = (dimension) => {
    return Math.min(3000, imageDimensions[dimension === 'width' ? 'width' : 'height'] * 10);
  };

  const validateDimension = (value, type) => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || numValue < 10) {
      return `${type} must be at least 10px`;
    }
    
    const maxValue = getMaxDimension(type.toLowerCase());
    if (numValue > maxValue) {
      return `${type} cannot exceed ${maxValue}px`;
    }

    return '';
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    
    if (presetKey !== 'custom') {
      const preset = RESIZE_PRESETS[presetKey];
      const newResize = { ...preset };
      
      // Ensure preset doesn't exceed max dimensions
      newResize.width = Math.min(newResize.width, getMaxDimension('width'));
      newResize.height = Math.min(newResize.height, getMaxDimension('height'));
      
      setResizeData(newResize);
      setLastValidResize(newResize);
      setWidthInput(newResize.width.toString());
      setHeightInput(newResize.height.toString());
      setWidthError('');
      setHeightError('');
    }
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
    setWidthError('');

    if (aspectRatioLocked) {
      const calculatedHeight = Math.round(numValue / originalAspectRatio);
      const heightError = validateDimension(calculatedHeight.toString(), 'Height');
      
      if (heightError) {
        setWidthError('Width too large for locked aspect ratio');
        return;
      }
      
      const newResize = { width: numValue, height: calculatedHeight };
      setResizeData(newResize);
      setLastValidResize(newResize);
      setHeightInput(calculatedHeight.toString());
      setHeightError('');
    } else {
      const newResize = { ...resizeData, width: numValue };
      setResizeData(newResize);
      setLastValidResize(newResize);
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
    setHeightError('');

    if (aspectRatioLocked) {
      const calculatedWidth = Math.round(numValue * originalAspectRatio);
      const widthError = validateDimension(calculatedWidth.toString(), 'Width');
      
      if (widthError) {
        setHeightError('Height too large for locked aspect ratio');
        return;
      }
      
      const newResize = { width: calculatedWidth, height: numValue };
      setResizeData(newResize);
      setLastValidResize(newResize);
      setWidthInput(calculatedWidth.toString());
      setWidthError('');
    } else {
      const newResize = { ...resizeData, height: numValue };
      setResizeData(newResize);
      setLastValidResize(newResize);
    }
  };

  const handleWidthBlur = () => {
    if (widthError) {
      setWidthInput(lastValidResize.width.toString());
      setWidthError('');
    }
  };

  const handleHeightBlur = () => {
    if (heightError) {
      setHeightInput(lastValidResize.height.toString());
      setHeightError('');
    }
  };

  const handleRotateQuick = (angle) => {
    const newAngle = (rotateAngle + angle) % 360;
    const normalizedAngle = newAngle < 0 ? newAngle + 360 : newAngle;
    setRotateAngle(normalizedAngle);
    setAngleInput(normalizedAngle.toString());
  };

  const handleAngleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setRotateAngle(value);
    setAngleInput(value.toString());
  };

  const handleAngleInputChange = (e) => {
    const value = e.target.value;
    setAngleInput(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const normalizedAngle = ((numValue % 360) + 360) % 360;
      setRotateAngle(normalizedAngle);
    }
  };

  const handleFlip = (direction) => {
    // For now, just apply current resize and rotate
    // Flip would need backend support
    alert(`Flip ${direction} functionality requires backend implementation`);
  };

  const handleApply = () => {
    if (!widthError && !heightError) {
      onApply({ resize: resizeData, rotate: rotateAngle });
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
          <h3 style={styles.title}>Resize & Rotate Image</h3>
          <button onClick={handleCancel} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.container}>
            {/* Preview Section */}
            <div style={styles.previewSection}>
              <div style={styles.previewWrapper}>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  style={{
                    ...styles.previewImage,
                    transform: `rotate(${rotateAngle}deg)`,
                    maxWidth: `${(resizeData.width / imageDimensions.width) * 100}%`,
                    maxHeight: `${(resizeData.height / imageDimensions.height) * 100}%`,
                  }}
                />
              </div>
              <div style={styles.previewInfo}>
                {resizeData.width} × {resizeData.height} px | {rotateAngle}°
              </div>
            </div>

            {/* Controls Section */}
            <div style={styles.controlsSection}>
              {/* Resize Controls */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Resize</h4>
                
                {/* Preset Buttons */}
                <div style={styles.presetButtons}>
                  {Object.keys(RESIZE_PRESETS).map((key) => (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key)}
                      style={{
                        ...styles.presetButton,
                        ...(selectedPreset === key ? styles.presetButtonActive : {})
                      }}
                    >
                      {key.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Aspect Ratio Lock */}
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={aspectRatioLocked}
                    onChange={(e) => setAspectRatioLocked(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Lock Aspect Ratio
                </label>

                {/* Dimension Inputs */}
                <div style={styles.dimensionInputs}>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Width (px)</label>
                    <input
                      type="number"
                      value={widthInput}
                      onChange={handleWidthChange}
                      onBlur={handleWidthBlur}
                      min="10"
                      max={getMaxDimension('width')}
                      style={{
                        ...styles.input,
                        ...(widthError ? styles.inputError : {})
                      }}
                    />
                    {widthError && <span style={styles.errorText}>{widthError}</span>}
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Height (px)</label>
                    <input
                      type="number"
                      value={heightInput}
                      onChange={handleHeightChange}
                      onBlur={handleHeightBlur}
                      min="10"
                      max={getMaxDimension('height')}
                      style={{
                        ...styles.input,
                        ...(heightError ? styles.inputError : {})
                      }}
                    />
                    {heightError && <span style={styles.errorText}>{heightError}</span>}
                  </div>
                </div>
              </div>

              {/* Rotate Controls */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Rotate</h4>
                
                {/* Quick Rotate Buttons */}
                <div style={styles.rotateButtons}>
                  <button onClick={() => handleRotateQuick(-90)} style={styles.rotateButton}>
                    ↺ 90° Left
                  </button>
                  <button onClick={() => handleRotateQuick(90)} style={styles.rotateButton}>
                    ↻ 90° Right
                  </button>
                  <button onClick={() => handleRotateQuick(180)} style={styles.rotateButton}>
                    ⟲ 180°
                  </button>
                </div>

                {/* Flip Buttons */}
                <div style={styles.rotateButtons}>
                  <button onClick={() => handleFlip('horizontal')} style={styles.rotateButton}>
                    ⟷ Flip Horizontal
                  </button>
                  <button onClick={() => handleFlip('vertical')} style={styles.rotateButton}>
                    ⟱ Flip Vertical
                  </button>
                </div>

                {/* Angle Slider */}
                <div style={styles.sliderGroup}>
                  <label style={styles.inputLabel}>Custom Angle</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotateAngle}
                    onChange={handleAngleSliderChange}
                    style={styles.slider}
                  />
                  <input
                    type="number"
                    value={angleInput}
                    onChange={handleAngleInputChange}
                    min="0"
                    max="360"
                    style={styles.angleInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleApply} style={styles.applyButton} disabled={!!(widthError || heightError)}>
            Apply Changes
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
    maxWidth: '1400px',
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
    overflow: 'hidden',
    minHeight: 0,
  },
  container: {
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '0',
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  previewWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'hidden',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  previewInfo: {
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  controlsSection: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
  },
  presetButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  presetButton: {
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
  presetButtonActive: {
    backgroundColor: '#3674B5',
    color: 'white',
    borderColor: '#3674B5',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  dimensionInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
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
  rotateButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  rotateButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#555',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '1 1 auto',
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  angleInput: {
    padding: '8px 12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
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

ResizeRotateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string,
  initialResize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  initialRotate: PropTypes.number,
  imageDimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
};

export default ResizeRotateModal;
