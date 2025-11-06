export const comparisonStyles = `
  .image-comparison {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 24px;
    margin: 20px auto;
    user-select: none;
    touch-action: none;
    background: linear-gradient(135deg, #f0f0f0 25%, transparent 25%) -10px 0,
                linear-gradient(225deg, #f0f0f0 25%, transparent 25%) -10px 0,
                linear-gradient(315deg, #f0f0f0 25%, transparent 25%),
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%);
    background-size: 20px 20px;
    background-color: #e8e8e8;
  }
  
  .image-comparison img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }
  
  .image-comparison .original-image {
    clip-path: inset(0 calc(100% - var(--slider-position)) 0 0);
  }
  
  .comparison-slider {
    position: absolute;
    top: 0;
    left: var(--slider-position);
    width: 6px;
    height: 100%;
    background: linear-gradient(180deg, #FF6B9D, #C44569, #FF6B9D);
    cursor: ew-resize;
    transform: translateX(-50%);
    z-index: 10;
    box-shadow: 0 0 10px rgba(255,107,157,0.8), 0 0 20px rgba(196,69,105,0.4);
  }
  
  .comparison-slider::before {
    content: '◀';
    position: absolute;
    top: 50%;
    left: -25px;
    transform: translateY(-50%);
    font-size: 24px;
    color: #FF6B9D;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    filter: drop-shadow(0 0 8px rgba(255,107,157,0.8));
  }
  
  .comparison-slider::after {
    content: '▶';
    position: absolute;
    top: 50%;
    right: -25px;
    transform: translateY(-50%);
    font-size: 24px;
    color: #FF6B9D;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    filter: drop-shadow(0 0 8px rgba(255,107,157,0.8));
  }
  
  .comparison-slider::before::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B9D, #FFA07A);
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(255,107,157,0.6);
  }
`;
