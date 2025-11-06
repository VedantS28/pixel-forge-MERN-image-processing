import PropTypes from "prop-types";

function TransformSection({
  transformations,
  handleTransformChange,
  onCropClick,
  onResizeRotateClick,
}) {
  return (
    <div className="card bg-gradient-to-br from-yellow-100 to-orange-100 shadow-2xl border-4 border-accent rounded-3xl transform hover:rotate-1 transition-all">
      <div className="card-body p-6">
        {/* Cartoonish Header */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-black text-accent">Transformations</h2>
        </div>

        {/* Image Adjustments Section */}
        <div className="mb-6 p-4 bg-white rounded-2xl border-2 border-dashed border-accent">
          <div className="flex items-center gap-2 mb-3">
            <h6 className="text-lg font-bold text-neutral">Image Adjustments</h6>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onCropClick}
              className="btn btn-primary btn-sm rounded-full border-2 shadow-md hover:scale-105 transition-transform"
              style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.15)' }}
            >
              Crop Image
            </button>
            <button
              onClick={onResizeRotateClick}
              className="btn btn-secondary btn-sm rounded-full border-2 shadow-md hover:scale-105 transition-transform"
              style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.15)' }}
            >
              Resize & Rotate
            </button>
          </div>
        </div>

        {/* Effects Section */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-success">
          <div className="flex items-center gap-2 mb-4">
            <h6 className="text-lg font-bold text-neutral">Effects</h6>
          </div>
          
          {/* Blur */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-bold">Blur (sigma)</span>
            </label>
            <input
              type="number"
              name="blur"
              value={transformations.blur}
              onChange={handleTransformChange}
              className="input input-bordered input-sm rounded-full border-2"
              min="0"
            />
          </div>

          {/* Quality Compression */}
          <div className="form-control mb-4 p-3 bg-gradient-to-r from-info/20 to-success/20 rounded-2xl">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="enableCompress"
                checked={transformations.enableCompress}
                onChange={handleTransformChange}
                className="checkbox checkbox-success border-2"
              />
              <span className="label-text font-bold">Enable Quality Compression</span>
            </label>
            <input
              type="range"
              name="compress.quality"
              min="1"
              max="100"
              value={transformations.compress.quality}
              onChange={handleTransformChange}
              className="range range-success mt-2"
              disabled={!transformations.enableCompress}
            />
            <div className="text-center text-sm font-bold mt-1">
              Quality: {transformations.compress.quality}%
            </div>
          </div>

          {/* Tint Color */}
          <div className="form-control mb-4 p-3 bg-gradient-to-r from-warning/20 to-error/20 rounded-2xl">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="enableTint"
                checked={transformations.enableTint}
                onChange={handleTransformChange}
                className="checkbox checkbox-warning border-2"
              />
              <span className="label-text font-bold">Enable Tint Color</span>
            </label>
            <input
              type="color"
              name="tint"
              value={transformations.tint}
              onChange={handleTransformChange}
              className="w-full h-12 rounded-2xl border-4 border-white shadow-lg cursor-pointer mt-2"
              disabled={!transformations.enableTint}
            />
          </div>

          {/* Boolean Effects */}
          <div className="grid grid-cols-3 gap-2">
            <div className="form-control">
              <label className="label cursor-pointer flex-col gap-1 p-2 bg-base-200 rounded-xl hover:bg-base-300 transition-colors">
                <input
                  type="checkbox"
                  name="grayscale"
                  checked={transformations.grayscale}
                  onChange={handleTransformChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text text-xs font-bold text-center">Gray</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer flex-col gap-1 p-2 bg-base-200 rounded-xl hover:bg-base-300 transition-colors">
                <input
                  type="checkbox"
                  name="negate"
                  checked={transformations.negate}
                  onChange={handleTransformChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text text-xs font-bold text-center">Negate</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer flex-col gap-1 p-2 bg-base-200 rounded-xl hover:bg-base-300 transition-colors">
                <input
                  type="checkbox"
                  name="sharpen"
                  checked={transformations.sharpen}
                  onChange={handleTransformChange}
                  className="checkbox checkbox-sm"
                />
                <span className="label-text text-xs font-bold text-center">Sharp</span>
              </label>
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
