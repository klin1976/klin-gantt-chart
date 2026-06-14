import { useCallback } from 'react';

export default function useSyncScroll() {
  const handleScroll = useCallback((source, targets) => {
    if (source.current) {
      targets.forEach(target => {
        if (target.current && target.current.scrollLeft !== source.current.scrollLeft) {
          target.current.scrollLeft = source.current.scrollLeft;
        }
      });
    }
  }, []);

  return handleScroll;
}
