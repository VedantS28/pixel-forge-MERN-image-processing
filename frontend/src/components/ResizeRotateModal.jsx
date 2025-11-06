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
          <button onClick={handleCancel} style={styles.closeButton}>×</button>
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
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'linear-gradient(135deg, #E0F7FF, #FFF5E4)',
    borderRadius: '30px',
    width: '95vw',
    height: '95vh',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 6px #74B9FF',
    overflow: 'hidden',
    border: '6px solid white',
  },
  header: {
    padding: '20px 30px',
    borderBottom: '4px solid #74B9FF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    background: 'linear-gradient(90deg, #74B9FF, #55E6C1)',
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
    border: '3px solid #74B9FF',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#74B9FF',
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
    background: 'linear-gradient(135deg, #f0f0f0 25%, transparent 25%) -10px 0, linear-gradient(225deg, #f0f0f0 25%, transparent 25%) -10px 0, linear-gradient(315deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%)',
    backgroundSize: '20px 20px',
    backgroundColor: '#e8e8e8',
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
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  previewInfo: {
    padding: '16px',
    background: 'linear-gradient(90deg, #74B9FF, #55E6C1)',
    color: 'white',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '800',
    fontFamily: "'Comic Sans MS', cursive",
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  controlsSection: {
    background: 'linear-gradient(180deg, #FFF9E6, #E0F7FF)',
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    borderLeft: '4px dashed #FFD93D',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '16px',
    background: 'white',
    borderRadius: '20px',
    border: '3px solid #55E6C1',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    color: '#C44569',
    marginBottom: '4px',
    fontFamily: "'Comic Sans MS', cursive",
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  },
  presetButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  presetButton: {
    padding: '10px 16px',
    border: '3px solid #74B9FF',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#2C3E50',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
    fontFamily: "'Comic Sans MS', cursive",
  },
  presetButtonActive: {
    background: 'linear-gradient(135deg, #74B9FF, #55E6C1)',
    color: 'white',
    borderColor: '#74B9FF',
    transform: 'translateY(-2px)',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#2C3E50',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: '700',
    fontFamily: "'Comic Sans MS', cursive",
  },
  checkbox: {
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    accentColor: '#55E6C1',
  },
  dimensionInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  inputGroup: {
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
  input: {
    padding: '12px 16px',
    border: '3px solid #FFD93D',
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
  rotateButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  rotateButton: {
    padding: '10px 16px',
    border: '3px solid #FFA07A',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#C44569',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '1 1 auto',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
    fontFamily: "'Comic Sans MS', cursive",
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    height: '8px',
    accentColor: '#FF6B9D',
  },
  angleInput: {
    padding: '12px 16px',
    border: '3px solid #FFA07A',
    borderRadius: '15px',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
  },
  footer: {
    padding: '20px 30px',
    borderTop: '4px solid #FFD93D',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    flexShrink: 0,
    background: 'linear-gradient(90deg, #E0F7FF, #FFF9E6)',
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
