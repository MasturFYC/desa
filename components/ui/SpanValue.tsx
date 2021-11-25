import React from "react";

interface SpanProps {
  isNumber?: boolean;
  isTotal?: boolean;
  children: React.ReactNode;
  width?: string | number;
  'aria-label'?: string | undefined
}

export default function Span(props: SpanProps) {
  let { isNumber, children, width, isTotal, "aria-label": ariaLabel } = props;

  return (
    <span
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel}
      style={{
        color: 'var(--blue)',
        textAlign: isNumber ? "right" : "left",
        fontWeight: isTotal ? 700 : 400,
        display: "block",
        width: width || 'auto'
      }}>
      {children}
    </span>
  );
}