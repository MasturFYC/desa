import React, { useEffect, useRef, useState } from "react";
import { iProduct, iUnit } from "@components/interfaces";
import { FormatNumber } from "@lib/format";
import DetailIcon from "@spectrum-icons/workflow/ViewDetail";
import { calculateStock } from "./calculateStock";
import {useToggleState} from '@react-stately/toggle';
import { useToggleButton } from "react-aria";
import { ToggleProps } from "@react-types/checkbox";


interface SisaStockProps extends ToggleProps {
  product: iProduct;
};
export function SisaStock(props: SisaStockProps) {
  let { product } = props;
  let [sisa, setSisa] = useState<string | undefined | null>(null);
  let [showWithUnit, setShowWithUnit] = useState<boolean>(false);
  let ref = useRef(null);
  let state = useToggleState(props);
  let {buttonProps, isPressed} = useToggleButton(props, state, ref);

  useEffect(() => {
    let isLoaded = false;

    async function loadUnits() {
      const url = `${process.env.apiKey}/unit/list/${product.id}`;
      const fetchOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      };
      const res = await fetch(url, fetchOptions);
      const json = await res.json();

      if (res.status === 200) {
        setSisa(
          calculateStock({
            stock: product.stock,
            units: json.sort((a: iUnit, b: iUnit) => b.content - a.content),
          })
        );
      }
    }

    if (!isLoaded && showWithUnit && product.stock !== 0) {
      loadUnits();
    }
    return () => {
      isLoaded = true;
    };
  }, [showWithUnit, product]);

  return (
    <span>
      Sisa Stock: <button
        {...buttonProps}
        className={'center'}
        style={{

          background: isPressed ? '#ececec' : state.isSelected ? '#ececec' : 'white',
          color: state.isSelected ? 'black' : 'green',
          WebkitUserSelect: 'none',
          outline: state.isSelected ? 1 : 'none',
        }}        aria-label="Icon only"
        onClick={() => setShowWithUnit(!showWithUnit)}
        ref={ref}
      >
        <DetailIcon size="S" marginBottom={{base: -5, M: -4}} />
      </button>
      <strong>
        {showWithUnit ? sisa : FormatNumber(product.stock) + ' ' + product.unit} 
      </strong>
      <style jsx>{`
      .center {
        padding: 0;
        margin: 0 6px;
        user-select: 'none';
        cursor: 'pointer';
        border: none;
        }        
        `}</style>
    </span>
  );
}
