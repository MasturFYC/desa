import React, { CSSProperties } from 'react';

type SpanLinkProps = {
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  children?: JSX.Element | JSX.Element[] | string | string[];
};

export default function SpanLink(props: SpanLinkProps) {
  let { onClick, children } = props;

  const hover = useHover(
    {
      color: "#3355ff",
      paddingLeft: 0,
      textAlign: "left",
      border: 'none',
      backgroundColor: 'transparent',
      textDecoration: 'underline',
      fontWeight: 700,
      cursor: 'pointer',
    },
    {
      color: "#0000ff",
      paddingLeft: 0,
      textAlign: "left",
      border: 'none',
      backgroundColor: 'transparent',
      fontWeight: 700,
      cursor: 'pointer',
    }
  );

  return (
    <button {...hover} onClick={onClick}>
      {children}
    </button>
  );
}

function useHover(styleOnHover: CSSProperties, styleOnNotHover: CSSProperties = {}) {
  const [style, setStyle] = React.useState(styleOnNotHover);
  const onMouseEnter = () => setStyle(styleOnHover);
  const onMouseLeave = () => setStyle(styleOnNotHover);

  return { style, onMouseEnter, onMouseLeave };
}
