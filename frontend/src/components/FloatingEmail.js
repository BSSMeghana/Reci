import React from 'react';
import { Mail } from 'lucide-react';
import './FloatingEmail.css';

const FloatingEmail = () => {
  return (
    <a
      href="mailto:meghana.bantubilli@gmail.com"
      className="floating-email"
      aria-label="Email Meghana"
      title="Email Meghana"
    >
      <Mail size={24} strokeWidth={2} />
    </a>
  );
};

export default FloatingEmail;
