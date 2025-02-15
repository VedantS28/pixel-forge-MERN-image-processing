import PropTypes from "prop-types";

function TransformSection({
  transformations,
  handleTransformChange,
  isCropEnabled,
  setIsCropEnabled,
  handleTransform,
}) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h2 className="h5 m-0">Apply Transformations</h2>
        <div>
          <button
            className={`btn btn-sm ${
              isCropEnabled ? "btn-danger" : "btn-light"
            } me-2`}
            onClick={() => setIsCropEnabled(!isCropEnabled)}
          >
            {isCropEnabled ? "Disable Crop" : "Enable Crop"}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label>Resize Width</label>
            <input
              type="number"
              name="resize.width"
              value={transformations.resize.width}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label>Resize Height</label>
            <input
              type="number"
              name="resize.height"
              value={transformations.resize.height}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label>Crop Width</label>
            <input
              type="number"
              name="crop.width"
              value={transformations.crop.width}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label>Crop Height</label>
            <input
              type="number"
              name="crop.height"
              value={transformations.crop.height}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label>Crop X</label>
            <input
              type="number"
              name="crop.x"
              value={transformations.crop.x}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label>Crop Y</label>
            <input
              type="number"
              name="crop.y"
              value={transformations.crop.y}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label>Rotate (degrees)</label>
            <input
              type="number"
              name="rotate"
              value={transformations.rotate}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label>Blur (sigma)</label>
            <input
              type="number"
              name="blur"
              value={transformations.blur}
              onChange={handleTransformChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label>Quality (1-100)</label>
            <input
              type="range"
              name="compress.quality"
              min="1"
              max="100"
              value={transformations.compress.quality}
              onChange={handleTransformChange}
              className="form-range"
            />
            <div className="text-center mt-2">
              {transformations.compress.quality}%
            </div>
          </div>
          <div className="col-md-6">
            <label>Tint Color</label>
            <input
              type="color"
              name="tint"
              value={transformations.tint}
              onChange={handleTransformChange}
              className="form-control form-control-color w-100"
            />
          </div>
        </div>

        <div className="row g-3 mt-4">
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
              <label className="form-check-label" htmlFor="grayscale">
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
              <label className="form-check-label" htmlFor="negate">
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
              <label className="form-check-label" htmlFor="sharpen">
                Sharpen
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleTransform}
          className="btn btn-success w-100 mt-4"
        >
          Apply Transformations
        </button>
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
  }).isRequired,
  handleTransformChange: PropTypes.func.isRequired,
  isCropEnabled: PropTypes.bool.isRequired,
  setIsCropEnabled: PropTypes.func.isRequired,
  handleTransform: PropTypes.func.isRequired,
};

export default TransformSection;
