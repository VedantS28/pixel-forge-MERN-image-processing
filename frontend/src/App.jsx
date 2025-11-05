import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadSection from './components/UploadSection';
import TransformSection from './components/TransformSection';
import ComparisonSection from './components/ComparisonSection';
import CropModal from './components/CropModal';
import ResizeRotateModal from './components/ResizeRotateModal';
import { comparisonStyles } from './styles/comparisonStyles';

// const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = 'http://localhost:5000';

const themeStyles = `
  :root {
    --theme-primary: #3674B5;
    --theme-secondary: #578FCA;
    --theme-accent: #578FCA;
    --theme-background: #D1F8EF;
  }
  
  body, .container {
    background-color: var(--theme-background);
  }
  
  .card-header.bg-info {
    background-color: var(--theme-primary) !important;
  }
  
  .card-header.bg-primary {
    background-color: var(--theme-secondary) !important;
  }
  
  .card-header.bg-success {
    background-color: var(--theme-accent) !important;
  }
  
  /* Heading Style */
  .app-heading {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--theme-primary);
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    margin-bottom: 1.5rem;
  }
  
  /* For large screens, force row to be a flex container with same height columns */
  @media (min-width: 992px) {
    .full-height {
      display: flex;
      align-items: stretch;
    }
  }
`;
  
function App() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [transformedImageUrl, setTransformedImageUrl] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isResizeRotateModalOpen, setIsResizeRotateModalOpen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [transformedFileSize, setTransformedFileSize] = useState(0);
  const [transformations, setTransformations] = useState({
    resize: { width: 1280, height: 720 },
    crop: { width: 1200, height: 500, x: 50, y: 50 },
    rotate: 0,
    compress: { quality: 80 },
    blur: 0,
    grayscale: false,
    negate: false,
    sharpen: false,
    tint: "#00FFF0",
    // Flags to enable/disable effects
    enableCompress: false,
    enableTint: false,
  });

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Cleanup session on component unmount
    return () => {
      if (newSessionId) {
        axios.delete(`${API_BASE_URL}/api/images/cleanup/${newSessionId}`)
          .catch(error => console.error('Cleanup error:', error));
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setOriginalImageUrl(url);
      setOriginalFileSize(selectedFile.size);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        // Initialize transformations with actual image dimensions
        setTransformations(prev => ({
          ...prev,
          resize: { width: img.naturalWidth, height: img.naturalHeight },
          crop: { width: img.naturalWidth, height: img.naturalHeight, x: 0, y: 0 }
        }));
      };
      img.src = url;
    }
  };

  const handleTransformChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newTransformations;
    
    if (type === 'checkbox') {
      newTransformations = {
        ...transformations,
        [name]: checked,
      };
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      newTransformations = {
        ...transformations,
        [parent]: {
          ...transformations[parent],
          [child]: type === 'range' ? parseInt(value) : value,
        },
      };
    } else {
      newTransformations = {
        ...transformations,
        [name]: type === 'number' ? parseInt(value) : value,
      };
    }
    
    setTransformations(newTransformations);
    
    // Auto-apply transformation
    if (filename) {
      applyTransformations(newTransformations);
    }
  };

  const applyTransformations = async (transformationsToApply) => {
    if (!filename) return;

    // Filter out disabled transformations
    const filteredTransformations = { ...transformationsToApply };
    
    // Remove compress if not enabled
    if (!transformationsToApply.enableCompress) {
      delete filteredTransformations.compress;
    }
    
    // Remove tint if not enabled
    if (!transformationsToApply.enableTint) {
      delete filteredTransformations.tint;
    }
    
    // Remove blur if it's 0
    if (transformationsToApply.blur === 0) {
      delete filteredTransformations.blur;
    }
    
    // Remove enable flags before sending to API
    delete filteredTransformations.enableCompress;
    delete filteredTransformations.enableTint;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/images/${filename}/transform`,
        { transformations: filteredTransformations },
        { responseType: 'blob', headers: { 'Content-Type': 'application/json' } }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setTransformedImageUrl(imageUrl);
      setTransformedFileSize(response.data.size);
    } catch (error) {
      console.error('Transform error:', error);
    }
  };

  const handleSliderDrag = (e) => {
    const container = document.querySelector('.image-comparison');
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseDown = (e) => {
    e.preventDefault(); 
    handleSliderDrag(e);
    
    const handleMouseMove = (e) => {
      handleSliderDrag(e);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!sessionId) {
      alert('Session not initialized. Please refresh the page.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'x-session-id': sessionId
        },
      });
      setFilename(response.data.filename);
      setOriginalImageUrl(response.data.imageUrl);
      // Show original image as preview immediately
      setTransformedImageUrl(response.data.imageUrl);
      setTransformedFileSize(file.size);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    }
  };

  const handleDownload = () => {
    if (transformedImageUrl) {
      const link = document.createElement('a');
      link.href = transformedImageUrl;
      link.download = 'transformed-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCropClick = () => {
    // Use transformed image if available, otherwise use original
    const imageToUse = transformedImageUrl || originalImageUrl;
    if (imageToUse) {
      setIsCropModalOpen(true);
    } else {
      alert('Please upload an image first.');
    }
  };

  const handleCropApply = (cropData) => {
    const newTransformations = {
      ...transformations,
      crop: cropData
    };
    setTransformations(newTransformations);
    applyTransformations(newTransformations);
  };

  const handleResizeRotateClick = () => {
    const imageToUse = transformedImageUrl || originalImageUrl;
    if (imageToUse) {
      setIsResizeRotateModalOpen(true);
    } else {
      alert('Please upload an image first.');
    }
  };

  const handleResizeRotateApply = (data) => {
    const newTransformations = {
      ...transformations,
      resize: data.resize,
      rotate: data.rotate || 0
    };
    setTransformations(newTransformations);
    applyTransformations(newTransformations);
  };

  return (
    <div className="container my-5">
      <style>{themeStyles}</style>
      <style>{comparisonStyles}</style>
      <h1 className="text-center mb-4 app-heading">Pixel Forge </h1>
      <div className="row full-height">
        {/* Preview column: 75% width on large screens (col-lg-9) */}
        <div className="col-lg-9 order-2 order-lg-1 mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
          {transformedImageUrl && originalImageUrl ? (
            <ComparisonSection
              transformedImageUrl={transformedImageUrl}
              originalImageUrl={originalImageUrl}
              sliderPosition={sliderPosition}
              handleMouseDown={handleMouseDown}
              handleDownload={handleDownload}
              originalFileSize={originalFileSize}
              transformedFileSize={transformedFileSize}
            />
          ) : (
            <div className="card shadow-sm flex-grow-1">
              <div className="card-body text-center d-flex align-items-center justify-content-center">
                <p>No image preview available.</p>
              </div>
            </div>
          )}
        </div>
        {/* Control column: 25% width on large screens (col-lg-3) */}
        <div className="col-lg-3 order-1 order-lg-2 d-flex flex-column gap-3">
          <UploadSection 
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            file={file}
          />
          <TransformSection 
            transformations={transformations}
            handleTransformChange={handleTransformChange}
            onCropClick={handleCropClick}
            onResizeRotateClick={handleResizeRotateClick}
          />
        </div>
      </div>

      {/* Crop Modal */}
      <CropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageUrl={transformedImageUrl || originalImageUrl}
        initialCrop={transformations.crop}
        onApply={handleCropApply}
      />

      {/* Resize & Rotate Modal */}
      <ResizeRotateModal
        isOpen={isResizeRotateModalOpen}
        onClose={() => setIsResizeRotateModalOpen(false)}
        imageUrl={transformedImageUrl || originalImageUrl}
        initialResize={transformations.resize}
        initialRotate={transformations.rotate}
        imageDimensions={imageDimensions}
        onApply={handleResizeRotateApply}
      />
    </div>
  );
}

export default App;