import { useRef } from 'react';

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
    dragging.current = true;
    startX.current = e.pageX;
    startScrollLeft.current = ref.current?.scrollLeft ?? 0;
    if (ref.current) ref.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !ref.current) return;
    e.preventDefault();
    const dx = e.pageX - startX.current;
    ref.current.scrollLeft = startScrollLeft.current - dx;
  }

  function onMouseUp() {
    dragging.current = false;
    if (ref.current) ref.current.style.cursor = '';
  }

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}
