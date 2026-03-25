import { useRef, useCallback } from 'react';

const FRICTION = 0.92;

export function useDragScroll(disabled?: boolean) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const animFrame = useRef<number | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (nodeRef.current) {
      nodeRef.current.removeEventListener('wheel', handleWheel);
    }
    nodeRef.current = node;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleWheel(e: WheelEvent) {
    const el = nodeRef.current;
    if (!el) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if ((e.target as HTMLElement).closest('.list-column')) return;

    e.preventDefault();
    el.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
  }

  function cancelMomentum() {
    if (animFrame.current !== null) {
      cancelAnimationFrame(animFrame.current);
      animFrame.current = null;
    }
  }

  function startMomentum() {
    cancelMomentum();
    function tick() {
      if (!nodeRef.current || Math.abs(velocity.current) < 0.3) return;
      nodeRef.current.scrollLeft -= velocity.current;
      velocity.current *= FRICTION;
      animFrame.current = requestAnimationFrame(tick);
    }
    animFrame.current = requestAnimationFrame(tick);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (disabled) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, [data-drag-handle], .list-column')) return;
    cancelMomentum();
    dragging.current = true;
    startX.current = e.pageX;
    startScrollLeft.current = nodeRef.current?.scrollLeft ?? 0;
    lastX.current = e.pageX;
    lastTime.current = performance.now();
    velocity.current = 0;
    if (nodeRef.current) nodeRef.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !nodeRef.current) return;
    e.preventDefault();
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) velocity.current = (e.pageX - lastX.current) / dt * 16;
    lastX.current = e.pageX;
    lastTime.current = now;
    nodeRef.current.scrollLeft = startScrollLeft.current - (e.pageX - startX.current);
  }

  function onMouseUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (nodeRef.current) nodeRef.current.style.cursor = '';
    startMomentum();
  }

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp };
}
