import React from 'react';
import Modal from '../ui/Modal';
import ImageUpload from './ImageUpload';
import { motion } from 'framer-motion';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <ImageUpload onSuccess={onClose} />
      </motion.div>
    </Modal>
  );
};

export default UploadModal;