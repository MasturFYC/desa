import React, { useEffect, useState } from "react";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import { env } from 'process';

interface customerBalance {
  id: number;
  descriptions: string;
  trxDate: string;
  debt: number;
  cred: number;
  saldo: number;
}
type CustomerBalanceDetailProps = {
  customerId: number;
};

type columnType = {
  id: number;
  name: string;
  className?: string;
};

export default function CustomerBalanceDetail({
  customerId
}: CustomerBalanceDetailProps) {
  let columns: columnType[] = [
    { id: 0, name: "ID#"},
    {
      id: 1,
      name: "TGL NOTA"
    },
    {
      id: 2,
      name: "MEMO"
    },
    { id: 3, name: "DEBIT", className: "tnumber" },
    { id: 4, name: "CREDIT", className: "tnumber" },
    { id: 5, name: "SALDO", className: "tnumber ttotal" },
  ];

  let payments = useAsyncList<customerBalance>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/customer/special-balance-detail/${customerId}`, {
        signal,
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: customerBalance) => item.id,
  });

  return (
    <>
      <div>
        <span style={{ fontWeight: 700 }}>Rincian Piutang</span>
      </div>
      <table aria-label={"table transaction"}>
        <thead aria-label={"table transaction head"}>
          <tr aria-label={"table transaction head tr"}>
            {columns.map((item) => <th key={item.id} className={item.className}>{item.name}</th>)}
          </tr>
        </thead>
        <tbody aria-label={"table transaction body"}>
          {payments && payments.items.map((item, i) => (
            <TabelRow key={i + '-' + item.id} item={item} i={i} />
          ))}
        </tbody>
        <tfoot aria-label={"table transaction footer"}>
          <tr aria-label={"table transaction foot tr"}>
            <td colSpan={3}>GRAND TOTAL ( {payments.items.length} items )</td>
            <td className="tnumber">{FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}</td>
            <td className="tnumber">{FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}</td>
            <td className="tnumber ttotal">{FormatNumber(payments.items.reduce((a, b) => a + b.debt - b.cred, 0))}</td>
          </tr>
        </tfoot>
      </table>
      <style jsx>
        {`
        div {
           margin-top: 24px;
        }
        {/* tr {
          border-left: 1px solid #999;
           border-right: 1px solid #999;
        } */}

        th {
          padding: 6px;
          font-weight: 500;
          text-align: left;
          font-size: 90%;
        }
        tfoot {
          background-color: #cfd9e9;
          color: #333;
          border-top: 1px solid #999;
          // border-bottom: 1px solid #999;
        }
        thead {
          background-color: #cdcdcd;
          color: #333;
          border-bottom: 1px solid #999;
        }
        table {
          width: 100%;
          margin-top: 12px;
          margin-bottom: 24px;
          border-collapse: collapse;
          // border: 1px solid #999;
          // border-radius: 6px;
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
     `}</style>
    </>
  );
}

type TableRowProps = {
  item: customerBalance,
  i: number
}
function TabelRow(props: TableRowProps): JSX.Element {
  let { item, i } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);

  return (<tr
    aria-label={"table transaction body tr"}
    onMouseEnter={() => setTrHovered(true)}
    onMouseLeave={() => setTrHovered(false)}
    className={trHovered ? 'trHovered' : (i % 2 === 0 ? 'tr-even' : 'tr-odd')}>
    <td>{item.id}</td>
    <td>{FormatDate(item.trxDate)}</td>
    <td>{item.descriptions}</td>
    <td className="tnumber">{FormatNumber(item.debt)}</td>
    <td className="tnumber">{FormatNumber(item.cred)}</td>
    <td className="tnumber ttotal">{FormatNumber(item.saldo)}</td>
    <style jsx>{`
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
  </tr>);
}

