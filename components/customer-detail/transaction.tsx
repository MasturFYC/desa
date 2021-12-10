import React, { Fragment, useEffect, useState } from "react";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";

interface transactionDetail {
  id: number;
  idx: number;
  trxDate: string;
  descriptions: string;
  title: string;
  qty: number;
  unit: string;
  price: number;
  debt: number;
  cred: number;
  saldo: number;
}

type columnType = {
  id: number;
  name: string;
  className?: string;
};

type TransactionProps = {
  customerId: number;
  lunasId?: number | null;
  handlePiutang?: (remainPayment: number) => void
};

export default function CustomerTransaction(props: TransactionProps) {
  
  let { customerId, lunasId = 0, handlePiutang } = props;

  let columns: columnType[] = [
    { id: 0, name: "REF ID#" },
    {
      id: 1,
      name: "TGL TRANSAKSI"
    },
    {
      id: 2,
      name: "MEMO"
    },
    {
      id: 3,
      name: "KETERANGAN"
    },
    { id: 4, name: "DEBIT", className: "tnumber" },
    { id: 5, name: "CREDIT", className: "tnumber" },
    { id: 6, name: "SALDO", className: "tnumber" },
  ];

  let payments = useAsyncList<transactionDetail>({
    async load({ signal }) {
      let res = await fetch(`/api/lunas/transactions`, {
        method: 'POST',
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ id: customerId, lunasId: lunasId })
      });
      let json = await res.json();

      if(res.status === 200) {
        handlePiutang && handlePiutang(json.reduce((a: number, b: transactionDetail) => a + b.debt - b.cred, 0));        
      }
      return { items: json };
    },
    getKey: (item: transactionDetail) => item.id,
  });

  // useEffect(() => {
  //   let isLoaded = false;

  //   if (!isLoaded && handlePiutang) {
  //     handlePiutang(payments.items.reduce((a, b) => a + b.debt - b.cred, 0));
  //   }

  //   return () => { isLoaded = true; }
  // }, [payments, handlePiutang])

  return (
    <Fragment>
      {payments.isLoading && <WaitMe />}
      <table aria-label={"table transaction"}>
        <thead aria-label={"table transaction head"}>
          <tr aria-label={"table transaction head tr"}>
            {columns.map((item) => <th key={item.id} className={item.className}>{item.name}</th>)}
          </tr>
        </thead>
        <tbody aria-label={"table transaction body"}>
          {payments && payments.items.map((item, i) => (
            <TabelRow key={i + '-' + item.id + '-' + item.idx} item={item} i={i} />
          ))}
        </tbody>
        <tfoot aria-label={"table transaction footer"}>
          <tr aria-label={"table transaction foot tr"}>
            <td colSpan={4}>GRAND TOTAL ( {payments.items.length} items )</td>
            <td className="tnumber">{FormatNumber(payments.items.reduce((a, b) => a + b.debt, 0))}</td>
            <td className="tnumber">{FormatNumber(payments.items.reduce((a, b) => a + b.cred, 0))}</td>
            <td className="tnumber ttotal">{FormatNumber(payments.items.reduce((a, b) => a + b.debt - b.cred, 0))}</td>
          </tr>
        </tfoot>
        <style jsx>
          {`
        div {
           margin-top: 24px;
        }
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
        //  border-bottom: 1px solid #999;
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
      </table>
    </Fragment>
  );
}

type TableRowProps = {
  item: transactionDetail,
  i: number
}
function TabelRow(props: TableRowProps): JSX.Element {
  let { item, i } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);

  return (<tr
    title={item.title}
    aria-label={"table transaction body tr"}
    onMouseEnter={() => setTrHovered(true)}
    onMouseLeave={() => setTrHovered(false)}
    className={trHovered ? 'trHovered' : (i % 2 === 0 ? 'tr-even' : 'tr-odd')}>
    <td>{item.id}</td>
    <td>{FormatDate(item.trxDate)}</td>
    <td>{item.descriptions}</td>
    <td>{item.idx === 2 || item.idx === 4 ? <>{FormatNumber(item.qty)} {item.unit} x {FormatNumber(item.price)}</> : '-'}</td>
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

