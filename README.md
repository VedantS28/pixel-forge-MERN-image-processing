# Pixel Forge

This project is a full stack system for an image processing service that allows users to upload images, apply various transformations, and compare the original and transformed images using a slider. The system includes image upload, transformation operations, and an intuitive user interface for real-time comparison.

## Features

### Image Management
- **Upload Image**: Allow users to upload images.
- **Transform Image**: Allow users to perform various transformations (resize, crop, rotate, blur, etc.).
- **Image Comparison**: Compare the original and transformed images using a slider.

### Image Transformation
- **Resize**
- **Crop**
- **Rotate**
- **Blur**
- **Grayscale**
- **Negate**
- **Sharpen**
- **Tint Color**
- **Quality Adjustment**

### Image Management Endpoints

**Upload an Image:**
```bash
   POST /images
```
- **Request Body:** Multipart form-data with image file.
- **Response:** Uploaded image details (URL, metadata).

**Apply Transformations to an Image:**

    POST /images/:id/transform

- **Request Body (JSON):**

        {
          "transformations": {
            "resize": {
              "width": "number",
              "height": "number"
            },
            "crop": {
              "width": "number",
              "height": "number",
              "x": "number",
              "y": "number"
            },
            "rotate": "number",
            "blur": "number",
            "grayscale": "boolean",
            "negate": "boolean",
            "sharpen": "boolean",
            "tintColor": "string",
            "quality": "number"
          }
        }

- **Response:** Transformed image details (URL, metadata).

**Retrieve an Image:**

    GET /images/:id

- **Response:** The actual image.

## Live Link
[\[Visit the website here\]](https://pixel-forge-mern-image-processing.vercel.app/)

## Video Demo
Will be uploaded soon

## Installation
Clone the repository:

```bash
git clone https://github.com/VedantS28/pixel-forge-MERN-image-processing
```
Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```
Start the backend server:

```bash
npm start
```

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```
Start the frontend server:

```bash
npm run dev
```
## Usage
**Upload Image:** Click on "Choose File" to upload an image.

**Apply Transformations:** Use the provided fields to apply transformations such as resize, crop, rotate, blur, etc.

**Image Comparison:** Use the slider to compare the original and transformed images in real-time.

**Download Transformed Image:** Download the transformed image after applying the desired transformations.

## Technologies Used
**MongoDB, Express.js, React.js, Node.js**

