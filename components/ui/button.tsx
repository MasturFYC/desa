import React, { useRef, CSSProperties } from 'react';
import { AriaButtonProps } from '@react-types/button';
import { useButton } from '@react-aria/button';
import { useHover } from '@react-aria/interactions';
import { useFocusRing } from '@react-aria/focus';

interface testType extends AriaButtonProps<'button'> {
  label: string,
}

export default function MyButton(props: testType) {
  let ref = useRef<HTMLButtonElement>(null);
  let { label, isDisabled } = props;
  let [events, setEvents] = React.useState<string[]>([]);
  let { hoverProps, isHovered } = useHover({
    onHoverStart: (e) =>
      setEvents((events) => [...events, `hover start with ${e.pointerType}`]),
    onHoverEnd: (e) =>
      setEvents((events) => [...events, `hover end with ${e.pointerType}`])
  });
  let { buttonProps, isPressed } = useButton(props, ref);
  let { isFocusVisible, focusProps } = useFocusRing();

  return (
    <button
      {...buttonProps}
      {...hoverProps}
      {...focusProps}
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        backgroundColor: isDisabled ? '#ececec'
          : isFocusVisible ? 'green' 
          : isHovered ? isPressed ? 'darkgreen' : 'green' : '#fcfcfc',
        color: isDisabled ? '#999' : isHovered || isFocusVisible ? '#ffffff' : 'darkgreen',
        border: isDisabled ? 'none' : '2px solid green',
        borderRadius: 99.9,
        fontWeight: 700,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        WebkitAppearance: 'none',
        appearance: 'none',
        padding: '6px 12px',
        outline: isFocusVisible ? '2px solid dodgerblue' : 'none',
        outlineOffset: 2
      }}
      ref={ref}>
      {label}
    </button>
  );
}