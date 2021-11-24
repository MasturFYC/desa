import React from "react";
import { LabelAriaProps } from "@react-aria/label";
import { useLabel } from "react-aria";

interface SpanProps extends LabelAriaProps {
  isNumber?: boolean,
  isTotal?: boolean
}

export default function Span(props: SpanProps) {
  let {labelProps} = useLabel(props);
  let {label, isNumber, isTotal} = props;

  return (
    <span
      {...labelProps}
      style={{
        color: 'var(--blue)',
        textAlign: isNumber ? "right" : "left",
        fontWeight: isTotal ? 700 : 400,
        display: "block"
      }}>
      {label}
    </span>
  );
}