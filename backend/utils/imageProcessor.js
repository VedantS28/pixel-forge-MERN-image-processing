const sharp = require('sharp');

const processImage = async (imageBuffer, transformations) => {
    let image = sharp(imageBuffer);

    // Apply crop transformation if provided
    if (transformations.crop) {
        let cropWidth = parseInt(transformations.crop.width, 10);
        let cropHeight = parseInt(transformations.crop.height, 10);
        let cropLeft = parseInt(transformations.crop.x, 10);
        let cropTop = parseInt(transformations.crop.y, 10);

        if (isNaN(cropWidth) || isNaN(cropHeight) || isNaN(cropLeft) || isNaN(cropTop)) {
            throw new Error('Crop values must be numeric');
        }

        const metadata = await image.metadata();
        const maxWidth = metadata.width - cropLeft;
        const maxHeight = metadata.height - cropTop;

        if (cropWidth > maxWidth || cropHeight > maxHeight) {
            throw new Error(`Invalid crop area. For an image of ${metadata.width}x${metadata.height}, crop width must be <= ${maxWidth} and crop height must be <= ${maxHeight}.`);
        }

        image = image.extract({
            width: cropWidth,
            height: cropHeight,
            left: cropLeft,
            top: cropTop,
        });
    }

    // Resize transformation
    if (transformations.resize) {
        let resizeWidth = parseInt(transformations.resize.width, 10);
        let resizeHeight = parseInt(transformations.resize.height, 10);

        if (isNaN(resizeWidth) || isNaN(resizeHeight)) {
            throw new Error('Resize values must be numeric');
        }
        image = image.resize(resizeWidth, resizeHeight);
    }

    // Rotate transformation (angle in degrees)
    if (transformations.rotate !== undefined) {
        let rotateAngle = parseInt(transformations.rotate, 10);
        if (isNaN(rotateAngle)) {
            throw new Error('Rotate angle must be numeric');
        }
        image = image.rotate(rotateAngle);
    }

    // Flip transformation (vertical flip)
    if (transformations.flip) {
        image = image.flip();
    }

    // Flop transformation (horizontal flip)
    if (transformations.flop) {
        image = image.flop();
    }

    // Blur transformation: value is the sigma of the blur
    if (transformations.blur) {
         let blurSigma = parseFloat(transformations.blur);
          if (isNaN(blurSigma)) {
            throw new Error('Blur sigma must be numeric');
        }
        image = image.blur(blurSigma);
    }

    // Compression transformation: adjust image quality for JPEG output if compress is provided
    // The compress property should be an object, e.g., { quality: 80 }
    // If no compress transformation is provided, output as default format.
    if (transformations.compress && transformations.compress.quality) {
        let compressQuality = parseInt(transformations.compress.quality, 10);
        if (isNaN(compressQuality)) {
            throw new Error('Compression quality must be numeric');
        }
        image = image.jpeg({ quality: compressQuality });
    }


    // Convert image to grayscale if specified
    if (transformations.grayscale) {
        image = image.grayscale();
    }

    // Negate image colors if specified
    if (transformations.negate) {
        image = image.negate();
    }

    // Sharpen image
    if (transformations.sharpen) {
        if (typeof transformations.sharpen === 'object') {
            image = image.sharpen(transformations.sharpen);
        } else {
            image = image.sharpen();
        }
    }


    if (transformations.tint && typeof transformations.tint === 'string') {
        const tintColor = transformations.tint.toLowerCase();
        if (tintColor !== '#ffffff' && tintColor !== 'white') {
            image = image.tint(transformations.tint);
        }
    }

    return image.toBuffer();
};

module.exports = { processImage };