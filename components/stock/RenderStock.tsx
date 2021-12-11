import Link from "next/link";
import React from "react";
import { iStock } from "@components/interfaces";
import { FormatDate, FormatNumber } from "@lib/format";

type RenderStockProps = {
  isStock?: boolean;
  index: number;
  item: iStock;
  children: JSX.Element;
};

export default function RenderStock(props: RenderStockProps) {
  let { isStock, index, item, children } = props;
  return (
    <tr key={item.id}>
      <td>{item.id}</td>
      <td>{children}</td>
      <td>{FormatDate(item.stockDate)}</td>
      {isStock &&
        <td><Link href={`/supplier/${item.supplierId}`} passHref><a>{item.supplierName}</a></Link></td>}
      <td className={'text-right text-bold'}>{FormatNumber(item.total)}</td>
      <td className={'text-right'}>{FormatNumber(item.cash)}</td>
      <td className={'text-right'}>{FormatNumber(item.payments)}</td>
      <td className={'text-right text-bold high-light'}>{FormatNumber(item.remainPayment)}</td>
      <style jsx>{`
        .high-light {
          color: #ff5599
        }
       .text-bold {
          font-weight: 700;
        }
        td {
          border-left: 1px dashed #cecece ;
          padding: 3px 6px;
          background-color: ${index % 2 === 0 ? 'transparent' : '#e9eff0'};
        }
        .text-right {
          text-align: right;
        }
        `}</style>
    </tr>
  );
}
