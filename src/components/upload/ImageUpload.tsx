import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageUp, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { uploadImage } from '../../services/imgbbService';
import { createPost } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { currentUser } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      // Reset states
      setError(null);
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
    onDropRejected: (rejections) => {
      if (rejections[0]?.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 5MB.');
      } else {
        setError('Invalid file. Please upload a valid image.');
      }
    }
  });

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image to upload');
      return;
    }
    
    if (!caption.trim()) {
      setError('Please add a caption for your image');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload image to ImgBB
      const imageUrl = await uploadImage(file);
      
      // Create post in Firebase
      await createPost(
        currentUser.uid,
        currentUser.username || 'Anonymous',
        imageUrl,
        caption
      );
      
      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Share an image
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an image and add a caption to share with the community
        </p>
      </div>
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 text-green-700 rounded-md"
        >
          Your image was uploaded successfully!
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 text-red-700 rounded-md"
        >
          {error}
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
            ${preview ? 'border-purple-500' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 mx-auto rounded-md object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="py-6">
              <ImageUp className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? "Drop the image here..."
                  : "Drag and drop an image, or click to select"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
        
        <Input
          label="Caption"
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your image..."
          maxLength={500}
        />
        
        <div className="flex justify-end space-x-4">
          {(file || caption) && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isUploading}
            disabled={!file || !caption.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ImageUpload;