// Add this to your App.js or create a separate MobileMenu.js component
import { useEffect } from 'react';

const MobileMenu = () => {
  useEffect(() => {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
    
    return () => {
      // Clean up event listener on component unmount
      if (mobileMenuButton) {
        mobileMenuButton.removeEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
        });
      }
    };
  }, []);
  
  return null;
};
