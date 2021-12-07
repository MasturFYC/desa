import React, { useState } from "react";
import { iCategory, iProduct, iUnit } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import { FormatNumber } from "@lib/format";
import { Flex } from "@react-spectrum/layout";

type productInfoProps = {
  product: iProduct;
  category: iCategory;
};

type stockType = {
  id: number;
  trxDate: string;
  faktur: string;
  name: string;
  realQty: number;
  unitName: string;
  debt: number;
  cred: number;
  saldo: number;
}

export default function ProductInfo(props: productInfoProps) {
  let { product, category } = props;

  return product && category ? (
    <ShowInfo product={product} category={category} />
  ) : (
    <WaitMe />
  );
}

function ShowInfo(props: productInfoProps) {
  let { product, category } = props;

  let units = useAsyncList<iUnit>({
    async load({ signal }) {
      let res = await fetch(`/api/unit/list/${product.id}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
      let json = await res.json();
      return {
        items: json.sort((a: iUnit, b: iUnit) => {
          return b.content - a.content;
        }),
      };
    },
    getKey: (item: iUnit) => item.id,
  });

  let stocks = useAsyncList<stockType>({
    async load({ signal }) {
      let res = await fetch(`/api/product/transaction-by-id/${product.id}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
      let json = await res.json();
      return {
        items: json,
      };
    },
    getKey: (item: stockType) => item.id,
  });

  return (
    <View>
      <Flex direction={{base:"column",L:"row"}} gap={"size-100"}>
        <View flex marginBottom={"size-100"}>
          <div>
            <span style={{ fontWeight: 700, fontSize: "18px" }}>
              {product.name}
            </span>
            , {product.spec}
          </div>
          <table style={{ borderCollapse: 'collapse' }}>
            <tr>
              <td><strong>Kategori: </strong></td>
              <td>{category.name}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: '12px' }}><strong>Harga beli: </strong></td>
              <td>Rp{FormatNumber(product.price)} / {product.unit}</td>
            </tr>
            {/* <tr>
          <td><strong>Stock awal: </strong></td>
          <td>{calculateStock({ stock: product.firstStock, units: units.items })}</td>
        </tr> */}
            <tr>
              <td><strong>Sisa stock: </strong></td>
              <td>{calculateStock({ stock: product.stock, units: units.items })}</td>
            </tr>
          </table>
        </View>
        <View>
          <ShowUnit units={units.items} unit={product.unit} />
        </View>
      </Flex>
      {stocks ? <ShowStock units={units.items} stocks={stocks.items} /> : <WaitMe />}
    </View>
  );
}

type ShowUnitProps = {
  units: iUnit[];
  unit: string;
}
function ShowUnit(props: ShowUnitProps) {
  let { units, unit } = props;
  let [hover, setHover] = useState<boolean>(false);
  let [rowId, setRowId] = useState<number>(0);

  return (
    <table>
      <thead>
        <tr>
          <th>UNIT</th>
          <th>ISI</th>
          <th className='cell-right'>HARGA BELI</th>
          <th className='cell-center'>MARGIN</th>
          <th className='cell-right'>HARGA JUAL</th>
        </tr>
      </thead>
      <tbody>
        {units && [...units].sort((a, b) => a.content - b.content).map((item, index) => (
          <tr key={item.id}
            onMouseEnter={() => { setRowId(item.id); setHover(true) }}
            onMouseLeave={() => { setRowId(0); setHover(false) }}
            className={hover && rowId === item.id ? 'tr-hover' : index % 2 === 1 ? 'tr-smoke' : undefined}>
            <td>{item.name}</td>
            <td>{item.content} {unit}</td>
            <td className='cell-right'>{FormatNumber(item.buyPrice)}</td>
            <td className='cell-center'>{(item.margin * 100).toFixed(2)}%</td>
            <td className='cell-right'>{FormatNumber(item.price)}</td>
          </tr>
        ))}
      </tbody>
      {/* <tfoot>
        <tr>
          <td colSpan={6}>TOTAL: {stocks.length} items</td>
          <td className='cell-right'>{calculateStock({ stock: stocks[stocks.length - 1] ? stocks[stocks.length - 1].saldo : 0, units: units })}</td>
        </tr>
      </tfoot> */}
      <style jsx>{`
        .tr-hover {
          background-color: royalblue;
          color: white;
        }
        .tr-smoke {
          background-color: whitesmoke;
        }
        table {
          border-collapse: collapse;
          border: 1px solid slategray;
         // height: 100%;
        }
        tfoot{border-top: 1px solid slategray;}
        thead {border-bottom: 1px solid slategray;}
        th {font-size: 90%; text-align: left;padding: 3px 6px;font-weight: 600;}
        td {padding: 3px 6px;}
        .cell-right {text-align: right;}
        .cell-center {text-align: center;}
      `}</style>
    </table>
  )
}

type ShowStockProps = {
  units: iUnit[];
  stocks: stockType[];
}

function ShowStock(props: ShowStockProps) {
  let { units, stocks } = props;
  let [hover, setHover] = useState<boolean>(false);
  let [rowId, setRowId] = useState<number>(0);

  return (
    <table>
      <thead>
        <tr>
          <th>ID#</th>
          <th>TANGGAL</th>
          <th>NO. FAKTUR</th>
          <th>KETERANGAN</th>
          <th className='cell-right'>DEBET</th>
          <th className='cell-right'>CREDIT</th>
          <th className='cell-right'>SALDO</th>
        </tr>
      </thead>
      <tbody>
        {stocks && stocks.map((item, index) => (
          <tr key={item.id}
            onMouseEnter={() => { setRowId(item.id); setHover(true) }}
            onMouseLeave={() => { setRowId(0); setHover(false) }}
            className={hover && rowId === item.id ? 'tr-hover' : index % 2 === 1 ? 'tr-smoke' : undefined}>
            <td>{item.id}</td>
            <td>{item.trxDate}</td>
            <td>{item.faktur}</td>
            <td>{item.name}</td>
            <td className='cell-right'>{item.debt} {item.debt === 0 ? '' : item.unitName}</td>
            <td className='cell-right'>{item.cred} {item.cred === 0 ? '' : item.unitName}</td>
            <td className='cell-right'>{calculateStock({ stock: item.saldo, units: units })}</td>
          </tr>
        ))}
      </tbody>
      {/* <tfoot>
        <tr>
          <td colSpan={6}>TOTAL: {stocks.length} items</td>
          <td className='cell-right'>{calculateStock({ stock: stocks[stocks.length - 1] ? stocks[stocks.length - 1].saldo : 0, units: units })}</td>
        </tr>
      </tfoot> */}
      <style jsx>{`
        .tr-hover {
          background-color: rebeccapurple;color:white;
        }
        .tr-smoke {
          background-color: whitesmoke;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
          border: 1px solid slategray;
          }
          tfoot{border-top: 1px solid slategray;}
          thead {border-bottom: 1px solid slategray;}
          th {font-size: 90%; text-align: left;padding: 3px 6px;font-weight: 600;}
          td {padding: 3px 6px;}
          .cell-right {
            text-align: right;
          }
      `}</style>
    </table>
  )
}

type calculateProps = {
  stock: number;
  units: iUnit[];
};

function calculateStock(props: calculateProps) {
  let { stock, units } = props;
  let remainStock = 0.0;
  let bstock = stock;
  let astock;
  let strRet = "";
  let min = "";

  if (stock < 0) {
    bstock = Math.abs(stock);
    min = "-";
  }

  if (bstock < 1) {
    strRet += bstock;
    strRet += " ";
    strRet +=
      units.length > 0
        ? (units[units.length - 1] ? units[units.length - 1].name : '')
        : "";
    //strRet.Append(", ");
    return strRet;
  }

  for (let c = 0; c < units.length; c++) {
    let r = units[c];

    remainStock = bstock % r.content;
    astock = (bstock - remainStock) / r.content;
    //astock = Math.Truncate(bstock); // Convert.ToDouble(bstock.ToString().Split('.')[0]);
    if (astock > 0) {
      strRet += min;
      strRet += astock;
      strRet += " ";
      strRet += r.name;
      if (remainStock > 0) {
        strRet += ", ";
      }
    }

    if (remainStock <= 0) break;
    bstock = remainStock;
  }
  //string[] splitter = new string[] { ", " };
  //strRet = string.Join(", ", strRet.Split(splitter, StringSplitOptions.RemoveEmptyEntries));
  return strRet.length == 0 ? "Habis" : strRet.toString();
}
