import { iUnit } from "@components/interfaces";

type calculateProps = {
  stock: number;
  units: iUnit[];
};
export function calculateStock(props: calculateProps) {
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

    if (remainStock <= 0)
      break;
    bstock = remainStock;
  }
  //string[] splitter = new string[] { ", " };
  //strRet = string.Join(", ", strRet.Split(splitter, StringSplitOptions.RemoveEmptyEntries));
  return strRet.length == 0 ? "Habis" : strRet.toString();
}
