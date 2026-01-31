'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MOCK_CODE = `// Importing a single module
import moduleName from
'modulePath';

// Interface implementation
interface Developer {
  skills: string[];
  passion: number;
}

const rijan: Developer = {
  skills: ['React', 'Next.js', 'AI'],
  passion: 100,
};`;

export default function CodeTyper() {
  const [displayedCode, setDisplayedCode] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedCode(MOCK_CODE.substring(0, i));
      i++;
      if (i > MOCK_CODE.length) {
        // Reset to loop
        setTimeout(() => {
          i = 0;
        }, 2000);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <pre className="font-mono text-xs md:text-sm text-blue-300/80 p-6 overflow-hidden">
      <code>
        {displayedCode}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-blue-400 ml-1 align-middle"
        />
      </code>
    </pre>
  );
}
