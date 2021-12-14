import React, { Fragment, useState } from "react";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import SearchIcon from "@spectrum-icons/workflow/Search";

type reportLrToko = {
  id: number;
  orderDate: string;
  name: string;
  spec: string;
  buyPrice: number;
  salePrice: number;
  discount: number;
  profit: number;
  qty: number;
  unit: string;
  subtotal: number;
};

type columnType = {
  id: number;
  name: string;
  className?: string;
  align: "start" | "center" | "end";
  width: string;
};

type ReportProps = {
  startDate: string;
  endDate: string;
  children: JSX.Element;
};

export default function ReportLrPenjualanToko(props: ReportProps) {
  let { startDate, endDate, children } = props;

  let columns: columnType[] = [
    { id: 0, name: "ID#", align: "start", width: "9%" },
    { id: 1, name: "TANGGAL", align: "start", width: "13%" },
    { id: 2, name: "KETERANGAN", align: "start", width: "26%" },
    { id: 3, name: "HARGA BELI", align: "start", width: "16%" },
    {
      id: 4,
      name: "HARGA JUAL",
      className: "tnumber",
      align: "end",
      width: "12%",
    },
    {
      id: 5,
      name: "DISCOUNT",
      className: "tnumber",
      align: "end",
      width: "12%",
    },
    { id: 6, name: "PROFIT", className: "tnumber", align: "end", width: "12%" },
    { id: 7, name: "QTY", className: "tnumber", align: "end", width: "12%" },
    { id: 8, name: "UNIT", align: "start", width: "12%" },
    {
      id: 9,
      name: "SUBTOTAL",
      className: "tnumber",
      align: "end",
      width: "12%",
    },
  ];

  let reports = useAsyncList<reportLrToko>({
    async load({ signal }) {
      let url: string = `/api/report/lr-penjualan-toko/${startDate}/${endDate}`;
      let res = await fetch(url, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();

      return { items: json };
    },
    getKey: (item: reportLrToko) => item.id,
  });

  return (
    <Fragment>
            <Flex direction={"row"} columnGap={"size-200"}>
            {children}
              <Button variant={"primary"} onPress={() => reports.reload()}>
                <SearchIcon size="S" marginEnd={"size-130"} />
                Search
              </Button>
            </Flex>
      <table aria-label={"table transaction"}>
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
          {reports.isLoading ? <tr><td colSpan={10}><WaitMe /></td></tr> :
            reports.items.map((item, i) => (
              <TabelRow key={i} item={item} i={i} />
            ))}
        </tbody>
        <tfoot aria-label={"table transaction footer"}>
          <tr aria-label={"table transaction foot tr"}>
            <td colSpan={5}>
              TOTAL PROFIT:{" "}
              {startDate === endDate
                ? FormatDate(startDate)
                : `${FormatDate(startDate)} - ${FormatDate(endDate)}`}{" "}
              ({reports.items.length} items)
            </td>
            <td className="tnumber">
              {FormatNumber(
                reports.items.reduce((a, b) => a + b.discount * b.qty, 0)
              )}
            </td>
            <td className="tnumber">
              {FormatNumber(reports.items.reduce((a, b) => a + b.profit, 0))}
            </td>
            <td></td>
            <td></td>
            <td className="tnumber ttotal">
              {FormatNumber(reports.items.reduce((a, b) => a + b.subtotal, 0))}
            </td>
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
              //table-layout:fixed;
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
          `}
        </style>
      </table>
    </Fragment>
  );
}

type TableRowProps = {
  item: reportLrToko;
  i: number;
};
function TabelRow(props: TableRowProps): JSX.Element {
  let { item, i } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);

  return (
    <tr
      //title={item.title}
      aria-label={"table transaction body tr"}
      onMouseEnter={() => setTrHovered(true)}
      onMouseLeave={() => setTrHovered(false)}
      className={trHovered ? "trHovered" : i % 2 === 0 ? "tr-even" : "tr-odd"}
    >
      <td>{item.id}</td>
      <td>{FormatDate(item.orderDate, "2-digit")}</td>
      <td>
        {item.name}, {item.spec}
      </td>
      <td className="tnumber">{FormatNumber(item.buyPrice)}</td>
      <td className="tnumber">{FormatNumber(item.salePrice)}</td>
      <td className="tnumber">{FormatNumber(item.discount)}</td>
      <td className="tnumber">{FormatNumber(item.profit)}</td>
      <td className="tnumber">{FormatNumber(item.qty)}</td>
      <td>{item.unit}</td>
      <td className="tnumber ttotal">{FormatNumber(item.subtotal)}</td>
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
