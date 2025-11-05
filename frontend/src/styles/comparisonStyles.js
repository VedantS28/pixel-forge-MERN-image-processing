export const comparisonStyles = `
  .image-comparison {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;
    margin: 20px auto;
    user-select: none;
    touch-action: none; /* Prevent scrolling on touch devices */
    background-color: #f0f0f0; /* Light gray background */
  }
  
  .image-comparison img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none; /* Prevent image dragging */
  }
  
  .image-comparison .original-image {
    clip-path: inset(0 calc(100% - var(--slider-position)) 0 0);
  }
  
  .comparison-slider {
    position: absolute;
    top: 0;
    left: var(--slider-position);
    width: 4px;
    height: 100%;
    background: white;
    cursor: ew-resize;
    transform: translateX(-50%);
    z-index: 10;
  }
  
  .comparison-slider::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: white;
    border: 3px solid #007bff;
  }
`;