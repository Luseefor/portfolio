'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?';

interface HyperTextProps {
  text: string;
  duration?: number;
  framerProps?: any;
  className?: string;
  animateOnLoad?: boolean;
}

export default function HyperText({
  text,
  duration = 800,
  framerProps = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  },
  className = '',
  animateOnLoad = true,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState(text.split(''));
  const [trigger, setTrigger] = useState(false);
  const iterations = useRef(0);
  const isFirstRender = useRef(true);

  const triggerAnimation = () => {
    iterations.current = 0;
    setTrigger(true);
  };

  useEffect(() => {
    if (!animateOnLoad && isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    triggerAnimation();
  }, [text, animateOnLoad]);

  useEffect(() => {
    if (!trigger) return;

    const interval = setInterval(
      () => {
        if (iterations.current < text.length) {
          setDisplayText((t) =>
            t.map((l, i) =>
              l === ' '
                ? l
                : i <= iterations.current
                  ? text[i]
                  : ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
            ),
          );
          iterations.current = iterations.current + 0.1;
        } else {
          setTrigger(false);
          setDisplayText(text.split(''));
          clearInterval(interval);
        }
      },
      duration / (text.length * 10),
    );

    return () => clearInterval(interval);
  }, [text, duration, trigger]);

  return (
    <div className="flex overflow-hidden" onMouseEnter={triggerAnimation}>
      <div className="flex">
        {displayText.map((letter, i) => (
          <motion.span key={i} className={`${className} inline-block font-mono`} {...framerProps}>
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
