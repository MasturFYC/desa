import React, { useEffect, useRef, useState } from "react";

function useComponentVisible<T extends HTMLElement = HTMLElement>(initialIsVisible: boolean, callback: () => void) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
  const ref = useRef<T>(null);

  const handleHideDropdown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };

  const handleClickOutside = (event: Event) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      callback()
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleHideDropdown, true);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('keydown', handleHideDropdown, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  return { ref, isComponentVisible, setIsComponentVisible };
}

export default useComponentVisible;