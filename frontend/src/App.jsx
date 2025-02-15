import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadSection from './components/UploadSection';
import TransformSection from './components/TransformSection';
import ComparisonSection from './components/ComparisonSection';
import { comparisonStyles } from './styles/comparisonStyles';

function App() {
  const [file, setFile] = useState(null);
  const [imageId, setImageId] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [transformedImageUrl, setTransformedImageUrl] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isCropEnabled, setIsCropEnabled] = useState(true);
  const [transformations, setTransformations] = useState({
    resize: { width: 1280, height: 720 },
    crop: { width: 1200, height: 500, x: 50, y: 50 },
    rotate: 0,
    compress: { quality: 80 },
    blur: 10,
    grayscale: true,
    negate: true,
    sharpen: true,
    tint: "#00FFF0"
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setOriginalImageUrl(URL.createObjectURL(selectedFile));
  };

  const handleTransformChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setTransformations((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTransformations((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'range' ? parseInt(value) : value,
        },
      }));
    } else {
      setTransformations((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value,
      }));
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
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://localhost:5000/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageId(response.data._id);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    }
  };

  const handleTransform = async () => {
    if (!imageId) {
      alert('Please upload an image first.');
      return;
    }

    const transformationsCopy = { ...transformations };
    
    if (!isCropEnabled) {
      delete transformationsCopy.crop;
    }
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/images/${imageId}/transform`,
        { transformations: transformationsCopy },
        { responseType: 'blob', headers: { 'Content-Type': 'application/json' } }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setTransformedImageUrl(imageUrl);
    } catch (error) {
      console.error('Transform error:', error);
      alert('Failed to apply transformations.');
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

  return (
    <div className="container my-5">
      <style>{comparisonStyles}</style>
      <h1 className="text-center mb-4">Pixel Forge - Image Processing Tool</h1>
      
      <UploadSection 
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />

      <TransformSection 
        transformations={transformations}
        handleTransformChange={handleTransformChange}
        isCropEnabled={isCropEnabled}
        setIsCropEnabled={setIsCropEnabled}
        handleTransform={handleTransform}
      />

      {transformedImageUrl && originalImageUrl && (
        <ComparisonSection 
          transformedImageUrl={transformedImageUrl}
          originalImageUrl={originalImageUrl}
          sliderPosition={sliderPosition}
          handleMouseDown={handleMouseDown}
          handleDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default App;