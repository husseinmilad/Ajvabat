import React from 'react';
import {splitHighlightSegments} from '../utils/persian.ts';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightedText({text, query, className = ''}: HighlightedTextProps) {
  const segments = React.useMemo(() => splitHighlightSegments(text, query), [text, query]);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.matched ? (
          <mark
            key={i}
            className="bg-[#D4AF37]/35 dark:bg-[#2DD4BF]/30 text-[#1C1917] dark:text-[#F4EFE6] rounded-[2px]"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
    </span>
  );
}
