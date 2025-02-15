const sharp = require('sharp');

const processImage = async (imageBuffer, transformations) => {
    let image = sharp(imageBuffer);

    // Apply crop transformation if provided
    if (transformations.crop) {
        const metadata = await image.metadata();
        const maxWidth = metadata.width - transformations.crop.x;
        const maxHeight = metadata.height - transformations.crop.y;

        if (transformations.crop.width > maxWidth || transformations.crop.height > maxHeight) {
            throw new Error(`Invalid crop area. For an image of ${metadata.width}x${metadata.height}, crop width must be <= ${maxWidth} and crop height must be <= ${maxHeight}.`);
        }

        image = image.extract({
            width: transformations.crop.width,
            height: transformations.crop.height,
            left: transformations.crop.x,
            top: transformations.crop.y,
        });
    }

    // Resize transformation
    if (transformations.resize) {
        image = image.resize(transformations.resize.width, transformations.resize.height);
    }

    // Rotate transformation (angle in degrees)
    if (transformations.rotate !== undefined) {
        image = image.rotate(transformations.rotate);
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
        image = image.blur(transformations.blur);
    }

    // Compression transformation: adjust image quality for JPEG output if compress is provided
    // The compress property should be an object, e.g., { quality: 80 }
    // If no compress transformation is provided, output as default format.
    if (transformations.compress && transformations.compress.quality) {
        image = image.jpeg({ quality: transformations.compress.quality });
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