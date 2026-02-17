import { useState } from 'react';

type RotateState = { x: number; y: number };

export function useCardTilt(active: boolean) {
  const [rotate, setRotate] = useState<RotateState>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isActiveState = active || isHovered;

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - card.left;
    const y = event.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    setRotate({ x: (y - centerY) / 20, y: (centerX - x) / 20 });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  return {
    rotate,
    isActiveState,
    onMouseMove,
    onMouseLeave,
    onMouseEnter,
  };
}
