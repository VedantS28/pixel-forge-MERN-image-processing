import PropTypes from "prop-types";

function TransformSection({
  transformations,
  handleTransformChange,
  onCropClick,
  onResizeRotateClick,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-success text-white">
        <h2 className="h5 m-0">Transformations</h2>
      </div>
      <div className="card-body">
        {/* Image Adjustments Section */}
        <div className="mb-4">
          <h6 className="text-muted mb-2">Image Adjustments</h6>
          <div className="d-grid gap-2">
            <button
              onClick={onCropClick}
              className="btn btn-outline-primary btn-sm"
            >
              ✂️ Crop Image
            </button>
            <button
              onClick={onResizeRotateClick}
              className="btn btn-outline-primary btn-sm"
            >
              🔄 Resize & Rotate
            </button>
          </div>
        </div>

        {/* Effects Section */}
        <div className="mb-3">
          <h6 className="text-muted mb-2">Effects</h6>
          
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <label className="form-label small">Blur (sigma)</label>
              <input
                type="number"
                name="blur"
                value={transformations.blur}
                onChange={handleTransformChange}
                className="form-control form-control-sm"
                min="0"
              />
            </div>
            <div className="col-md-6">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  name="enableCompress"
                  checked={transformations.enableCompress}
                  onChange={handleTransformChange}
                  className="form-check-input"
                  id="enableCompress"
                />
                <label className="form-check-label small" htmlFor="enableCompress">
                  Enable Quality Compression
                </label>
              </div>
              <input
                type="range"
                name="compress.quality"
                min="1"
                max="100"
                value={transformations.compress.quality}
                onChange={handleTransformChange}
                className="form-range"
                disabled={!transformations.enableCompress}
              />
              <div className="text-center small">
                Quality: {transformations.compress.quality}%
              </div>
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-12">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  name="enableTint"
                  checked={transformations.enableTint}
                  onChange={handleTransformChange}
                  className="form-check-input"
                  id="enableTint"
                />
                <label className="form-check-label small" htmlFor="enableTint">
                  Enable Tint Color
                </label>
              </div>
              <input
                type="color"
                name="tint"
                value={transformations.tint}
                onChange={handleTransformChange}
                className="form-control form-control-color w-100"
                disabled={!transformations.enableTint}
              />
            </div>
          </div>

          <div className="row g-2 mt-3">
            <div className="col-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="grayscale"
                  checked={transformations.grayscale}
                  onChange={handleTransformChange}
                  className="form-check-input"
                  id="grayscale"
                />
                <label className="form-check-label small" htmlFor="grayscale">
                  Grayscale
                </label>
              </div>
            </div>
            <div className="col-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="negate"
                  checked={transformations.negate}
                  onChange={handleTransformChange}
                  className="form-check-input"
                  id="negate"
                />
                <label className="form-check-label small" htmlFor="negate">
                  Negate
                </label>
              </div>
            </div>
            <div className="col-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="sharpen"
                  checked={transformations.sharpen}
                  onChange={handleTransformChange}
                  className="form-check-input"
                  id="sharpen"
                />
                <label className="form-check-label small" htmlFor="sharpen">
                  Sharpen
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

TransformSection.propTypes = {
  transformations: PropTypes.shape({
    resize: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    crop: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    rotate: PropTypes.number.isRequired,
    blur: PropTypes.number.isRequired,
    compress: PropTypes.shape({
      quality: PropTypes.number.isRequired,
    }).isRequired,
    tint: PropTypes.string.isRequired,
    grayscale: PropTypes.bool.isRequired,
    negate: PropTypes.bool.isRequired,
    sharpen: PropTypes.bool.isRequired,
    enableCompress: PropTypes.bool.isRequired,
    enableTint: PropTypes.bool.isRequired,
  }).isRequired,
  handleTransformChange: PropTypes.func.isRequired,
  onCropClick: PropTypes.func.isRequired,
  onResizeRotateClick: PropTypes.func.isRequired,
};

export default TransformSection;
