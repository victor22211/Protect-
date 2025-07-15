
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

interface FormattedMessageProps {
  text: string;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ text }) => {
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.MathJax?.typesetPromise && contentRef.current) {
      window.MathJax.typesetPromise([contentRef.current]).catch((err) =>
        console.error('MathJax typesetting error:', err)
      );
    }
  }, [text]);

  return (
    <span ref={contentRef} className="whitespace-pre-wrap break-words">
      {text}
    </span>
  );
};

export default FormattedMessage;
