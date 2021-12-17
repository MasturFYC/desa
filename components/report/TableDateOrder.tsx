import React, { useState } from "react";
import { FormatNumber } from "@lib/format";
import dynamic from "next/dynamic";
import Link from "next/link";


const TableDateOrderDetail = dynamic(() => import("./TableDateOrderDetail"), {
  ssr: false,
});


export type ReportPenjualanByDateType = {
  id: number;
  orderType: number;
  customerName: string;
  buyPrice: number;
  salePrice: number;
  subtotal: number;
  discount: number;
  profit: number;
}

type TableDateOrderProps = {
  reports: ReportPenjualanByDateType[];
  children?: JSX.Element;
};

export function TableDateOrder(props: TableDateOrderProps): JSX.Element {
  let { reports, children } = props;
  let columns = [
    { id: 0, name: 'O-ID#', className: '' },
    { id: 1, name: 'PELANGGAN', className: '' },
    { id: 2, name: 'HARGA BELI', className: 'tnumber' },
    { id: 3, name: 'HARGA JUAL', className: 'tnumber' },
    { id: 4, name: 'PROFIT', className: 'tnumber' },
    { id: 5, name: 'DISCOUNT', className: 'tnumber' },
    { id: 6, name: 'NET-PROFIT', className: 'tnumber' },
  ];
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
      {reports.map((item, i) => <RowDateOrder key={item.id} item={item} index={i} />)}
    </tbody>
    {children}
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
              border-top: 1px solid #999;
              //  border-bottom: 1px solid #999;
            }
            thead {
              background-color: #ececec;
              color: #333;
              border-bottom: 2px dashed orange;
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

type RowDateOrderProps = {
  item: ReportPenjualanByDateType;
  index: number;
};

export function RowDateOrder(props: RowDateOrderProps): JSX.Element {
  let { item, index } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [selectedId, setSelectedId] = useState<number>(0);

  function viewDetail(id: number) {
    setSelectedId(id);
    setShowDetail(!showDetail);
  }

  return (
    <>
      <tr
        //title={item.title}
        aria-label={"table transaction body tr"}
        onMouseEnter={() => setTrHovered(true)}
        onMouseLeave={() => setTrHovered(false)}
        className={showDetail ? 'row-sel' : trHovered ? "trHovered" : index % 2 === 0 ? "tr-even" : "tr-odd"}
      >
        <td><Link href={'#'} passHref><a onClick={() => viewDetail(item.id)}>{item.id}</a></Link></td>
        <td>{item.customerName}</td>
        <td className="tnumber">{FormatNumber(item.buyPrice)}</td>
        <td className="tnumber">{FormatNumber(item.salePrice)}</td>
        <td className="tnumber">{FormatNumber(item.subtotal)}</td>
        <td className="tnumber">{FormatNumber(item.discount)}</td>
        <td className="tnumber ttotal">{FormatNumber(item.profit)}</td>
      </tr>
      {showDetail && item.id === selectedId && <tr>
        <td colSpan={7} className="table-child">
          <TableDateOrderDetail id={selectedId} orderType={item.orderType} />
        </td>
      </tr>}
      <style jsx>
        {`
            .table-child {
              padding: 0 0 0 6px;
              margin: 0;
              background-color: darkred;
              color: #000;
            }
          .row-sel {
            // border-bottom: 1px solid #cecece;
            // border-left: 2px solid orange;
            padding: 0 0 0 2px;
            background-color: darkred;
            color: #fff;
            font-weight: 700
          }
          .row-sel a { color: #fff;}

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
    </>
  );
}
