import React from "react";
import { iCategory, iProduct, iUnit } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { useAsyncList, AsyncListData } from "@react-stately/data";
import { FormatNumber } from "@lib/format";

type productInfoProps = {
  product: iProduct;
  category: iCategory;
};

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
      let res = await fetch(`/api/unit/list/${product.id}`, { signal });
      let json = await res.json();
      return {
        items: json.sort((a: iUnit, b: iUnit) => {
          return b.content - a.content;
        }),
      };
    },
    getKey: (item: iUnit) => item.id,
  });

  return (
    <View>
      <div>
        <span style={{ fontWeight: 700, fontSize: "18px" }}>
          {product.name}
        </span>
        , {product.spec}
      </div>
      <table style={{borderCollapse: 'collapse'}}>
        <tr>
          <td><strong>Kategori: </strong></td>
          <td>{category.name}</td>
        </tr>
        <tr>
          <td style={{paddingRight: '12px'}}><strong>Harga beli: </strong></td>
          <td>Rp{FormatNumber(product.price)} / {product.unit}</td>
        </tr>
        <tr>
          <td><strong>Stock awal: </strong></td>
          <td>{calculateStock({ stock: product.firstStock, units: units.items })}</td>
        </tr>
        <tr>
          <td><strong>Sisa stock: </strong></td>
          <td>{calculateStock({ stock: product.stock, units: units.items })}</td>
        </tr>
      </table>
    </View>
  );
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
        ? units.sort((a, b) => a.content - b.content)[0].name
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
