import React, { useEffect } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'charla-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function SupportChat() {
  useEffect(() => {
    // Create and append widget element
    const widgetElement = document.createElement('charla-widget');
    widgetElement.setAttribute('p', '6afef11b-df87-4ec0-897e-772629966b79');
    document.body.appendChild(widgetElement);

    // Create and append widget script
    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://app.getcharla.com/widget/widget.js';
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    // Cleanup function
    return () => {
      document.body.removeChild(widgetElement);
      const existingScript = document.querySelector('script[src="https://app.getcharla.com/widget/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}