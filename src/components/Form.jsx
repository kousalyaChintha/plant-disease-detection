import React, { useState } from 'react';
import './Form.css';
import CodeGenerator from './CodeGenerator';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BuildIcon from '@mui/icons-material/Build';

function Form() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false); // New state to track if the image is uploaded

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setImageUploaded(true); // Set the imageUploaded state to true when the image is selected
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('latitude', '49.207');
    formData.append('longitude', '16.608');
    formData.append('similar_images', 'true');
    const datetime = new Date().toISOString().split('.')[0];
    formData.append('datetime', datetime);

    setIsLoading(true);
    setError(''); // Clear previous error

    try {
      const response = await sendRequest(formData);

      if (response && response.result && response.result.disease) {
        const diseases = response.result.disease.suggestions;
        
        if (diseases && diseases.length > 0) {
          setDiseases(diseases.slice(0, 3));
        } else {
          setDiseases([{ name: 'No diseases detected' }]);
        }
      } else {
        setDiseases([{ name: 'No disease information in the response.' }]);
      }

      setError(''); // Clear error message after successful request
    } catch (error) {
      setError('Something went wrong!');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle retries
  const sendRequest = async (formData, retries = 3, delay = 2000) => {
    try {
      const response = await fetch('https://crop.kindwise.com/api/v1/identification', {
        method: 'POST',
        body: formData,
        headers: {
          'Api-Key': 'IPB2fl0pN6IAOiK1ZiI2KUxvOBWDBrBBmsUj8hfoUecISiTy0q', // Replace with your actual API key
        },
      });

      if (response.status === 429 && retries > 0) {
        // If rate-limited, wait and retry
        console.log('Rate-limited. Retrying...');
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait for the specified delay
        return sendRequest(formData, retries - 1, delay * 2); // Retry with exponential backoff
      }

      if (!response.ok) {
        throw new Error('Failed to fetch data from the API');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="container">
      <h1>Upload Image for Disease Identification</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="form">

        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          required
          onChange={handleImageChange}
          startIcon={<CloudUploadIcon />}
          >
          Select Image
          <VisuallyHiddenInput
            type="file"
            onChange={handleImageChange}
            multiple
            />
        </Button>

          {!imageUploaded && !isLoading && (
            <p style={{ marginBottom: '20px' }}>Upload your image</p>
          )}
        {/* Show the success message when an image is uploaded */}
        {imageUploaded && !isLoading && (
          <p style={{ color: 'green', marginTop: '20px' }}>Image uploaded successfully!</p>
        )}

        <Button style={{ marginTop: '5px' }} type='submit' variant="contained" disabled={isLoading}> <BuildIcon />
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <h2>Disease Suggestions</h2>
      {diseases.length > 0 ? (
        <ul className="disease-list">
          {diseases.map((disease, index) => (
                        <div key={index}>
              <li className="disease-item">
                <strong>Name:</strong> {disease.name} <br />
                <strong>Probability:</strong> {disease.probability || 'N/A'} <br />
                <strong>Scientific Name:</strong> {disease.scientific_name || 'N/A'} <br /><br />
              </li>
              <CodeGenerator problem={disease.name} />
            </div>
          ))}
        </ul>
      ) : (
        <p>No diseases detected.</p>
      )}
    </div>
  );
}

export default Form;
