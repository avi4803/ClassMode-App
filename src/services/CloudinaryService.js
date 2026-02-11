import { Platform } from 'react-native';

const CLOUD_NAME = 'dhdzkaod1';
const UPLOAD_PRESET = 'timetable_uploads_preset';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export const CloudinaryService = {
  uploadFile: (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', UPLOAD_URL);

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else if (xhr.status === 429) {
          reject(new Error('Rate limit exceeded. Please try again later.'));
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total);
            onProgress(percentComplete);
          }
        };
      }

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg', // Default or from picker
        name: file.name || 'upload.jpg',
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      xhr.send(formData);
    });
  }
};
