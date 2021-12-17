import React, { useState } from "react";
import { FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";

type TableDateOrderDetailType = {
  id: number;
  productName: string;
  buyPrice: number;
  salePrice: number;
  discount: number;
  qty: number;
  unit: string;
  profit: number;
}

type TableDateOrderDetailProps = {
  id: number;
  orderType: number;
  children?: JSX.Element
};

export default function TableDateOrderDetail(props: TableDateOrderDetailProps): JSX.Element {
  let { id, orderType, children } = props;
  let columns = [
    { id: 0, name: 'D-ID#', className: '' },
    { id: 1, name: 'KETERANGAN', className: '' },
    { id: 2, name: 'HARGA BELI', className: 'tnumber' },
    { id: 3, name: 'HARGA JUAL', className: 'tnumber' },
    { id: 4, name: 'DISCOUNT', className: 'tnumber' },
    { id: 5, name: 'QTY', className: 'tnumber' },
    { id: 6, name: 'UNIT', className: '' },
    { id: 7, name: 'NET-PROFIT', className: 'tnumber' },
  ];

  let reports = useAsyncList<TableDateOrderDetailType>({
    async load({ signal }) {
      let url: string = `/api/report/lr-penjualan-date-order-detail/${id}/${orderType}`;
      let res = await fetch(url, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();

      return { items: json };
    },
    getKey: (item: TableDateOrderDetailType) => item.id,
  });


  return <table aria-label={"table transaction"}>
    <thead aria-label={"table transaction head"}>
      <tr aria-label={"table transaction head tr"}>
        {columns.map((item) => (
          <th key={item.id} className={item.className}>
            {item.name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody aria-label={"table transaction body"}>
      {reports.items.map((item, i) => <RowDateOrderDetail key={item.id} item={item} index={i} />)}
    </tbody>
    {children && children}
    <style jsx>
      {`
            th {
              padding: 0px 6px;
              font-weight: 500;
              text-align: left;
              font-size: 90%;
              color: #999;
            }
            tfoot {
              background-color: #cfd9e9;
              color: #333;              
              //  border-bottom: 1px solid #999;
            }
            thead {
              background-color: #ececec;
              color: #333;
              border-bottom: 2px dashed darkred;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              //table-layout:fixed;
              // border: 1px solid #999;
              // border-radius: 6px;
            }
            .tnumber {
              text-align: right;
            }
          `}
    </style>
  </table>;
}

type RowDateOrderDetailProps = {
  item: TableDateOrderDetailType;
  index: number;
};

export function RowDateOrderDetail(props: RowDateOrderDetailProps): JSX.Element {
  let { item, index } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);

  return (
    <tr
      //title={item.title}
      aria-label={"table transaction body tr"}
      onMouseEnter={() => setTrHovered(true)}
      onMouseLeave={() => setTrHovered(false)}
      className={trHovered ? "trHovered" : index % 2 === 0 ? "tr-even" : "tr-odd"}
    >
      <td>{item.id}</td>
      <td>{item.productName}</td>
      <td className="tnumber">{FormatNumber(item.buyPrice)}</td>
      <td className="tnumber">{FormatNumber(item.salePrice)}</td>
      <td className="tnumber">{FormatNumber(item.discount)}</td>
      <td className="tnumber">{FormatNumber(item.qty)}</td>
      <td>{item.unit}</td>
      <td className="tnumber ttotal">{FormatNumber(item.profit)}</td>
      <style jsx>
        {`
          .td-id {
            max-width: 64px;
          }
          td {
            padding: 3px 6px;
          }
          .tnumber {
            text-align: right;
          }
          .ttotal {
            font-weight: 700;
          }
          .trHovered {
            background-color: #d0e0f0;
          }
          .tr-even {
            background-color: #fff;
          }
          .tr-odd {
            background-color: #e9eff9;
          }
        `}
      </style>
    </tr>
  );
}
