import React, { useRef } from "react";
import { useHover } from "@react-aria/interactions";
import { isAndroid, isIPhone } from "@react-aria/utils";

type DivLinkProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
  index?: number;
  isHeader?: boolean;
  isFooter?: boolean;
  selectedColor?: string;
  backColor?: string;
  isSelected?: boolean;
  width?: {
    base?: string;
    M?: string;
  };
  isHidden?: boolean;
  "aria-label"?: string | undefined;
};

export default function Div(props: DivLinkProps) {
 //let ref = useRef<HTMLDivElement>(null);
  let [events, setEvents] = React.useState<string[]>([]);
  let {
    children,
    index,
    isHeader,
    isFooter,
    isHidden,
    "aria-label": ariaLabel,
    isSelected,
    backColor,
    selectedColor,
  } = props;
  let { hoverProps, isHovered } = useHover({
    onHoverStart: (e) =>
      setEvents((events) => [...events, `hover start with ${e.pointerType}`]),
    onHoverEnd: (e) =>
      setEvents((events) => [...events, `hover end with ${e.pointerType}`]),
  });
  //let { width: mobile } = useViewportSize();

  return (
    <div
      aria-labelledby={ariaLabel}
      aria-label={ariaLabel}
      {...hoverProps}
      className={"div-row"}
      style={{
        display: isHidden && (isIPhone() || isAndroid()) ? "none" : "block",
        padding: isHeader || isFooter ? "8px 0" : "6px 0",
        borderTopLeftRadius: isHeader ? "6px" : "none",
        borderTopRightRadius: isHeader ? "6px" : "none",
        borderBottomLeftRadius: isFooter ? "6px" : "none",
        borderBottomRightRadius: isFooter ? "6px" : "none",
        borderTop:
          isHeader || (index === 0 && (isIPhone() || isAndroid()))
            ? "1px solid #c8cfdf"
            : undefined, //|| (index === 0 && mobile <= 640) ? '1px solid #c8cfdf' : isFooter ? '1px solid #c8cfdf' : 'none',
        marginBottom: isFooter ? "16px" : 0,
        marginTop: isHeader ? "16px" : 0,
      }}
    >
      {children}
      <style jsx>{`
        .div-row {
          background-color: ${isHeader
          ? "#e1e8ef"
          : isFooter
          ? "#eee"
          : isHovered
          ? "#e8effe"
          : backColor || '#ffffff'
          // var(--spectrum-alias-background-color-gray-300)'
          // : "#ffffff"
          };
          border-right: 1px solid #c8cfdf;
          border-left: ${isSelected ? selectedColor : "1px solid #c8cfdf"};
          color: #333;
          border-bottom: ${isHeader
            ? "1px solid #c8cfdf"
            : isFooter
            ? "1px solid #c8cfdf"
            : "1px solid #d1d8df"};
        }
      `}</style>
    </div>
  );
}
