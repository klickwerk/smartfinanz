import { useEffect } from 'react';

/**
 * Hook to prevent body scrolling when modals are open
 * @param isModalOpen Boolean indicating if any modal is open
 */
export const useModalScrollLock = (isModalOpen: boolean) => {
  useEffect(() => {
    // Get the body element
    const body = document.body;
    
    if (isModalOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Add the modal-open class to prevent scrolling
      body.classList.add('modal-open');
      
      // Set the top position to maintain the scroll position visually
      body.style.top = `-${scrollY}px`;
    } else {
      // Get the scroll position from the body's top style
      const scrollY = body.style.top;
      
      // Remove the modal-open class to re-enable scrolling
      body.classList.remove('modal-open');
      
      // Reset the top position
      body.style.top = '';
      
      // Restore the scroll position if there was one
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY.replace('-', '')) || 0);
      }
    }
    
    // Cleanup function to ensure body scrolling is re-enabled when component unmounts
    return () => {
      body.classList.remove('modal-open');
      body.style.top = '';
    };
  }, [isModalOpen]);
};