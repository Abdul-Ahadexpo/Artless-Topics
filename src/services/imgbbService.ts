import { ImgBBResponse } from '../types';

const IMGBB_API_KEY = '80e36fc64660321209fefca92146c6f0';
const IMGBB_API_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }

    const data: ImgBBResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to upload image');
    }

    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};