const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    url: {
        type: String,
        required: true,
    },
    transformations: {
        type: Object,
    },
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);