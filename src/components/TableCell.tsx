import React from 'react';

interface TableCellProps {
  content: string;
  maxLength?: number;
  type?: 'text' | 'url' | 'headline' | 'comment';
  className?: string;
}

export default function TableCell({ content, maxLength = 40, type = 'text', className = '' }: TableCellProps) {
  const shouldTruncate = content.length > maxLength;
  const truncatedContent = shouldTruncate 
    ? `${content.slice(0, maxLength)}...` 
    : content;
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const cellRef = React.useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!shouldTruncate) return;
    
    const rect = cellRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Position tooltip 20px above cursor
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY - 20
    });
  };

  if (type === 'headline' || type === 'text') {
    if (shouldTruncate) {
      return (
        <div className="relative">
          <span
            ref={cellRef}
            className={`${className} cursor-help`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onMouseMove={handleMouseMove}
          >
            {truncatedContent}
          </span>
          {showTooltip && (
            <div
              className="fixed z-[60] px-4 py-2 text-sm text-white bg-gray-900 rounded-lg max-w-sm whitespace-normal shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y
              }}
            >
              {content}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      );
    }
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {content}
    </span>
  );
}