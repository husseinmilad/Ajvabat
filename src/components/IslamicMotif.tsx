import React from 'react';

export function HeroArchivalMandala({className = ''}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g opacity="0.18" className="text-[#0F4C46] dark:text-[#2DD4BF]">
        <circle cx="200" cy="200" r="184" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="200" cy="200" r="152" stroke="currentColor" strokeWidth="1" />
        <rect x="85" y="85" width="230" height="230" stroke="currentColor" strokeWidth="1.2" />
        <rect
          x="85"
          y="85"
          width="230"
          height="230"
          transform="rotate(45 200 200)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="112"
          y="112"
          width="176"
          height="176"
          transform="rotate(22.5 200 200)"
          stroke="#9A6B25"
          strokeWidth="1"
        />
        <rect
          x="112"
          y="112"
          width="176"
          height="176"
          transform="rotate(67.5 200 200)"
          stroke="#9A6B25"
          strokeWidth="1"
        />
        <circle cx="200" cy="200" r="76" stroke="#9A6B25" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
