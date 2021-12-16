import React, { Fragment, useState } from "react";
import { FormatDate, FormatNumber } from "@lib/format";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import SearchIcon from "@spectrum-icons/workflow/Search";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { TextField } from "@react-spectrum/textfield";
import Link from "next/link";
import { reportLrToko, TableBodyReportByDate } from "./lr-penjualan-date";

type columnType = {
  id: number;
  name: string;
  className?: string;
  align: "start" | "center" | "end";
  width: string;
};

type ReportProps = {
  filter: FilterTabType;
  children: JSX.Element;
  months: {
  id: number;
  name: string;
} []
};

export default function ReportLrPenjualanByYear(props: ReportProps) {
  let { filter, children, months } = props;

  let columns: columnType[] = [
    { id: 0, name: "BULAN", align: "start", width: "9%" },
    { id: 1, name: "HARGA BELI", className: "tnumber", align: "end", width: "16%" },
    { id: 2, name: "HARGA JUAL", className: "tnumber", align: "end", width: "12%" },
    { id: 3, name: "PROFIT", className: "tnumber", align: "end", width: "12%" },
    { id: 4, name: "DISCOUNT", className: "tnumber", align: "end", width: "12%" },
    { id: 5, name: "NET-PROFIT", className: "tnumber", align: "end", width: "12%" }
  ];

  let reports = useAsyncList<reportLrToko>({
    async load({ signal }) {
      let url: string = `/api/report/lr-penjualan-year/${filter.year}/${filter.month}`;
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
              <TabelRow year={filter.year} key={i} item={item} i={i} months={months} />
            ))}
        </tbody>
        <tfoot aria-label={"table transaction footer"}>
          <tr aria-label={"table transaction foot tr"}>
            <td>
              Tahun: {filter.year}<br />bulan: {filter.monthName}<br />{reports.items.length} items
            </td>
            <td className="tnumber">
              {FormatNumber(
                reports.items.reduce((a, b) => a + b.buyPrice, 0)
              )}
            </td>
            <td className="tnumber">
              {FormatNumber(reports.items.reduce((a, b) => a + b.salePrice, 0))}
            </td>
            <td className="tnumber">
              {FormatNumber(reports.items.reduce((a, b) => a + b.subtotal, 0))}
            </td>
            <td className="tnumber ttotal">
              {FormatNumber(reports.items.reduce((a, b) => a + b.discount, 0))}
            </td>
            <td className="tnumber ttotal">
              {FormatNumber(reports.items.reduce((a, b) => a + (b.profit), 0))}
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
              margin-top: 24px;
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
  year: number;
  item: reportLrToko;
  i: number;
  months: {id: number,name:string}[]
};

function TabelRow(props: TableRowProps): JSX.Element {
  let { year, item, i, months } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);
  let [showDetail, SetShowDetail] = useState<boolean>(false);
  let [details, setDetails] = useState<reportLrToko[]>([]);

  async function loadDetail(year: number, month: number) {
    const url = `/api/report/lr-penjualan-month/${year}/${month}`;
    const fetchOptions = {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      }
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      setDetails(json)
    } else {
      console.log(json.message);
    }
  }

  return (
    <>
      <tr
        //title={item.title}
        aria-label={"table transaction body tr"}
        onMouseEnter={() => setTrHovered(true)}
        onMouseLeave={() => setTrHovered(false)}
        className={trHovered ? "trHovered" : i % 2 === 0 ? "tr-even" : "tr-odd"}
      >
        <td><Link href={'#'} passHref><a onClick={() => {
          let test = !showDetail;
          SetShowDetail(test);

          test && loadDetail(year, item.id);
        }}>{months[item.id].name}</a></Link></td>
        <td className="tnumber">{FormatNumber(item.buyPrice)}</td>
        <td className="tnumber">{FormatNumber(item.salePrice)}</td>
        <td className="tnumber">{FormatNumber(item.subtotal)}</td>
        <td className="tnumber">{FormatNumber(item.discount)}</td>
        <td className="tnumber">{FormatNumber(item.profit)}</td>
      </tr>

      {showDetail && details && <tr>
        <td colSpan={6} className={'table-child'}>
          <table>
            <thead aria-label={"table transaction head"}>
              <tr aria-label={"table transaction head tr"}>
                <th>TANGGAL</th>
                <th className="tnumber">HARGA BELI</th>
                <th className="tnumber">HARGA JUAL</th>
                <th className="tnumber">PROFIT</th>
                <th className="tnumber">DISCOUNT</th>
                <th className="tnumber">NET-PROFIT</th>
              </tr>
            </thead>
            <tbody>
              {details.map((item, index) => <TabelRowDetail item={item} i={index} key={item.orderDate} />)}
            </tbody>
          </table>          
        </td>
        </tr>
      }
      <style jsx>        
        {`
            th {
              padding: 6px;
              font-weight: 500;
              text-align: left;
              font-size: 90%;
              border-bottom: 1px dashed #cecece;
              background-color: #ececec;
            }

            .table-child {
//               border-top: 2px solid red;
              padding: 0 0 0 6px;
              background-color: green;
            }

          table {
            width: 100%;
            border: 1px dashed #cecece;
            border-collapse: collapse
          }
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


export type FilterTabType = { year: number, month: number, monthName: string };


type FilterTabProps = {
  filter: FilterTabType;
  setFilter: (props: FilterTabType) => void;
  months: { id: number, name: string }[];
}

export function FilterTab(props: FilterTabProps) {
  let { setFilter, filter, months } = props;

  return <>
    <TextField
      type={'number'}
      maxLength={4}
      width={{ base: "auto", M: "size-2000" }}
      labelPosition={"side"}
      label={"Tahun"}
      value={filter.year.toString()}
      onChange={(e) => setFilter({ ...filter, year: +e })} />
    <ComboBox
      label={'Bulan'}
      labelPosition={'side'}
      width={{ base: "auto", M: "size-2400" }}
      items={months} selectedKey={filter.month} onSelectionChange={(e) => setFilter({
        ...filter, month: +e,
        monthName: months.filter(o => o.id === +e)[0].name
      })}>
      {(item) => <Item>{item.name}</Item>}
    </ComboBox>
  </>;
}


type TableDetailRowProps = {
  item: reportLrToko;
  i: number;
};


function TabelRowDetail(props: TableDetailRowProps): JSX.Element {
  let { item, i } = props;
  let [trHovered, setTrHovered] = useState<boolean>(false);
  let [showDetail, setShowDetail] = useState<boolean>(false);

  return (
    <>
      <tr
        //title={item.title}
        aria-label={"table transaction body tr"}
        onMouseEnter={() => setTrHovered(true)}
        onMouseLeave={() => setTrHovered(false)}
        className={ trHovered ? "trHovered" : i % 2 === 0 ? "tr-even" : "tr-odd"}
      >
        <td><Link href={'#'} passHref><a onClick={() => {
          setShowDetail(!showDetail);
        }}>{item.id.toString().padStart(2,'0')}</a></Link></td>
        <td className="tnumber">{FormatNumber(item.buyPrice)}</td>
        <td className="tnumber">{FormatNumber(item.salePrice)}</td>
        <td className="tnumber">{FormatNumber(item.subtotal)}</td>
        <td className="tnumber">{FormatNumber(item.discount)}</td>
        <td className="tnumber">{FormatNumber(item.profit)}</td>
      </tr>
      {showDetail && <tr>
        <td colSpan={6} className={'row-sel table-child'}>
          <ReportPenjualanByDate startDate={item.orderDate} />
        </td>
      </tr>}
      <style jsx>
        {`
            .table-child {
              padding: 0 0 0 6px;
              margin: 0;
            }

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
          .row-sel {
            background-color: orange;
            border-bottom: 1px solid #cecece;
          }
          .color-sel, .color-sel a  {
            color: #000;
          }
        `}
      </style>
    </>
  );
}

type ReportByDateProps = {
  startDate: string
};

function ReportPenjualanByDate(props: ReportByDateProps) {
  let { startDate } = props;
  let reports = useAsyncList<reportLrToko>({
    async load({ signal }) {
      let url: string = `/api/report/lr-penjualan-date/${startDate}/${startDate}/0`;
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
      <TableBodyReportByDate reports={reports.items} filter={{
        startDate: startDate,
        endDate: startDate,
        saleType: 0
      }} />
  );
}
