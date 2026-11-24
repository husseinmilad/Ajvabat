import React from 'react';

export function ShamsehEmblem({className = 'w-9 h-9'}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="13"
        y="13"
        width="38"
        height="38"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-[#9A6B25] dark:text-[#D4AF37]"
      />
      <rect
        x="13"
        y="13"
        width="38"
        height="38"
        rx="3"
        transform="rotate(45 32 32)"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-[#0F4C46] dark:text-[#2DD4BF]"
      />
      <circle
        cx="32"
        cy="32"
        r="14"
        className="fill-[#F8F5EE] dark:fill-[#191D21] stroke-[#0F4C46] dark:stroke-[#2DD4BF]"
        strokeWidth="1.5"
      />
      <path
        d="M23 37C27 35 30 35.5 32 37.5C34 35.5 37 35 41 37V26.5C37 24.8 34 25.4 32 27.5C30 25.4 27 24.8 23 26.5V37Z"
        className="fill-[#0F4C46] dark:fill-[#2DD4BF]"
        fillOpacity="0.9"
      />
      <line
        x1="32"
        y1="27.5"
        x2="32"
        y2="37.5"
        className="stroke-[#F8F5EE] dark:stroke-[#191D21]"
        strokeWidth="1.3"
      />
    </svg>
  );
}

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
