import { useEffect, useRef } from 'react';

const useClickOutside = (handler, shallow = false) => {
  const domNode = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domNode.current &&
        !domNode.current.contains(event.target) &&
        (shallow
          ? domNode.current.parentElement?.contains(
              event.target
            )
          : true)
      ) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return domNode;
};

export default useClickOutside;
