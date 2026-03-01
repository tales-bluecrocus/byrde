import '@testing-library/jest-dom';

// Mock window.byrdeSettings
window.byrdeSettings = {
  logo: '',
  phone: '(555) 123-4567',
  phone_raw: '5551234567',
  email: 'test@example.com',
  site_name: 'Test Site',
  apiUrl: '/wp-json/byrde/v1',
};

// Mock window.dataLayer
window.dataLayer = [];
