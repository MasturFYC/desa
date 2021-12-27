import { dateParam, grassCostType } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { FormatNumber } from "@lib/format";
import { AsyncListData } from "@react-stately/data";
import { ActionButton } from "@react-spectrum/button";
import PinAdd from "@spectrum-icons/workflow/Add";
import PinRemove from "@spectrum-icons/workflow/Remove";
import PinSave from "@spectrum-icons/workflow/Checkmark";
import { Children, useState } from "react";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import useClickOutside from "@components/ui/use-outside-click";



const initData: grassCostType = {
  grassId: 0,
  id: 0,
  memo: "",
  qty: 0,
  unit: "",
  price: 0,
  subtotal: 0,
  createdAt: dateParam(null),
  updatedAt: dateParam(null),
};

type GrassCostListProps = {
  grassId: number;
  costs: AsyncListData<grassCostType>;
  updateTotal?: (total: number) => void;
};
function GrassCostList(props: GrassCostListProps): JSX.Element {
  let { costs, grassId, updateTotal } = props;
  let [selectedCost, setSelectedCost] = useState<number>(-1);
  let [data, setData] = useState<grassCostType>({} as grassCostType);
  let [isDirty, setIsDirty] = useState<boolean>(false);

  let { ref, isComponentVisible } = useClickOutside<HTMLTableElement>(
    true,
    (isCanceled: boolean = false) => {
      if (isCanceled) {
        setSelectedCost(-1);
      } else {
        if (isDirty) {
          saveCost(data);
        } else {
          setSelectedCost(-1);
        }
      }
    }
  );

  async function removeCost(id: number, total: number) {
    const url = `${process.env.apiKey}/grass-cost/${id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      costs.remove(id);
      updateTotal && updateTotal(+total);
      setIsDirty(false);
      setSelectedCost(-1);
    } else {
      console.log("Data biaya tidak dapat disimpan!");
    }
  }

  async function saveCost(p: grassCostType) {
    const url = `${process.env.apiKey}/grass-cost/${p.id}`;
    const fetchOptions = {
      method: p.id === 0 ? "POST" : "PUT",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: p }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      if (p.id === 0) {
        setData({...initData, grassId: grassId});
        setSelectedCost(-1);
        costs.append(json);
        updateTotal && updateTotal(-json.subtotal);
        setSelectedCost(0);
      } else {
        let cost = costs.getItem(p.id);
        updateTotal && updateTotal((-json.subtotal) + cost.subtotal);
        costs.update(p.id, json);
        setSelectedCost(-1);
      }
      setIsDirty(false);
    } else {
      console.log("Data biaya tidak dapat disimpan!");
    }
  }

  function handleChange(col: string, value: string | number) {
    let o = { ...data };

    if (col === "qty") {
      let v = value as number;
      o.subtotal = o.price * v;
    }

    if (col === "price") {
      let v = value as number;
      o.subtotal = o.qty * v;
    }

    setData({ ...o, [col]: value });
    setIsDirty(true);
  }

  return (
    <table ref={ref}>
      <thead>
        <tr>
          <th className={"text-left static-width"}>ID</th>
          <th className={"text-left memo-width"}>MEMO</th>
          <th className={"text-right qty-width"}>QTY</th>
          <th className={"text-left qty-width"}>UNIT</th>
          <th className={"text-right"}>HARGA</th>
          <th className={"text-right"}>SUBTOTAL</th>
          <th className={"text-right static-width"}> </th>
        </tr>
      </thead>
      <tbody>
        {costs.isLoading ? (
          <tr>
            <td colSpan={7}>
              <WaitMe />
            </td>
          </tr>
        ) : (
          [...costs.items, { ...initData, grassId: grassId }].map(
            (cost, index) =>
              selectedCost === cost.id ? (
                <tr key={cost.id}>
                  <td>{data.id}</td>
                  <td>
                    <TextField
                      isQuiet
                      width={"100%"}
                      placeholder={"e.g. Kopi kapal api"}
                      maxLength={50}
                      autoFocus
                      aria-label={"Cost-memo"}
                      value={data.memo}
                      onChange={(e) => handleChange("memo", e)}
                    />
                  </td>
                  <td className={"text-right"}>
                    <NumberField
                      isQuiet
                      width={"100%"}
                      hideStepper
                      aria-label={"Cost-qty"}
                      value={data.qty}
                      onChange={(e) => handleChange("qty", e)}
                    />
                  </td>
                  <td>
                    <TextField
                      isQuiet
                      width={"100%"}
                      placeholder={"e.g. pcs"}
                      maxLength={6}
                      aria-label={"Cost-unit"}
                      value={data.unit}
                      onChange={(e) => handleChange("unit", e)}
                    />
                  </td>
                  <td className={"text-right"}>
                    <NumberField
                      isQuiet
                      width={"100%"}
                      hideStepper
                      aria-label={"Cost-price"}
                      value={data.price}
                      onChange={(e) => handleChange("price", e)}
                    />
                  </td>
                  <td className={"text-right"}>
                    <NumberField
                      isQuiet
                      width={"100%"}
                      hideStepper
                      isReadOnly
                      aria-label={"Cost-subtotal"}
                      value={data.subtotal}
                      onChange={(e) => handleChange("subtotal", e)}
                    />
                  </td>
                  <td>
                    {data.id === 0 && (
                      <ActionButton
                        isDisabled={
                          !isDirty ||
                          data.subtotal === 0 ||
                          data.unit.length === 0 ||
                          data.memo.length === 0
                        }
                        isQuiet
                        flex
                        margin={0}
                        height={"auto"}
                        onPress={(e) => {
                          if (isDirty) {
                            saveCost(data);
                          }
                        }}
                      >
                        <PinAdd size={"S"} />
                      </ActionButton>
                    )}
                    {data.id > 0 && (
                      <ActionButton
                        isDisabled={
                          (data.qty === 0 ||
                          data.price === 0 ||
                          data.unit.length === 0 ||
                          data.memo.length === 0) || !isDirty
                        }
                        isQuiet
                        onPress={() => {
                          if (isDirty) {
                            saveCost(data);
                          }
                        }}
                        height={"auto"}
                        flex
                        margin={0}
                      >
                        <PinSave size={"S"} />
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ) : (
                grassId > 0 && <CostRow
                  key={cost.id}
                  cost={cost}
                  index={index}
                  onClick={(id: number, p: grassCostType) => {
                    setData(cost), setSelectedCost(id);
                  }}
                >                  
                  <ActionButton
                    isQuiet
                    onPress={() => removeCost(cost.id, cost.subtotal)}
                    height={"auto"}
                    flex
                    margin={0}
                  >
                    <PinRemove size={"S"} />
                  </ActionButton>
                </CostRow>
              )
          )
        )}
      </tbody>
      <tfoot>
        <tr>
          <td className={"text-left"} colSpan={5}>
            TOTAL: ({costs.items.length} items)
          </td>
          <td className={"text-right text-bold"}>
            {FormatNumber(costs.items.reduce((a, b) => a + b.subtotal, 0))}
          </td>
          <td> </td>
        </tr>
      </tfoot>
      <style jsx>{`
       .memo-width {
          width: 45%;
        }
        .static-width {
          width: 32px;
        }
        .qty-width {
          width: 64px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          border: 1px dashed #999;
          background-color: #fff;
        }
        thead,
        tfoot td {
          background-color: #d9e0e9;
        }
        .row-even {
          background-color: white;
        }
        th {
          font-weight: 600;
          font-size: 90%;
        }
        th {
          padding: 8px 6px;
        }
        td {
          padding: 3px 6px;
          background-color: #f0fff9;
        }
        .text-right {
          text-align: right;
        }
        .text-left {
          text-align: left;
        }
        .text-bold {
          font-weight: 700;
        }
      `}</style>
    </table>
  );
}

export default GrassCostList;

type CostRowProps = {
  cost: grassCostType;
  index: number;
  children: JSX.Element;
  onClick: (id: number, p: grassCostType) => void;
};

function CostRow(props: CostRowProps): JSX.Element {
  let { cost, index, onClick: setCost, children } = props;
  let [hovered, setHovered] = useState<boolean>(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      key={cost.id}
      className={hovered ? "hovered" : index % 2 === 0 ? "row-even" : undefined}
      onClick={() => setCost(cost.id, cost)}
    >
      
      <td>{cost.id === 0 ? <PinAdd size={'XS'} /> : cost.id}</td>
      <td colSpan={cost.id === 0 ? 5 : 1}>{cost.id === 0 ? 'Add item' : cost.memo}</td>
      <td className={"text-right hide-col"}>{FormatNumber(cost.qty)}</td>
      <td className={'hide-col'}>{cost.unit}</td>
      <td className={"text-right hide-col"}>{FormatNumber(cost.price)}</td>
      <td className={"text-right text-bold hide-col"}>{FormatNumber(cost.subtotal)}</td>
      <td>{cost.id != 0 && children}</td>

      <style jsx>{`
        .hide-col {
          display: ${cost.id === 0 ? 'none' : undefined};
        }
        .hovered {
          background-color: rgb(255, 239, 209);
        }
        .row-even {
          background-color: white;
        }
        td {
          padding: 3px 6px;
          border-bottom: 1px dashed #fae3a3;
        }
        .text-right {
          text-align: right;
        }
        .text-bold {
          font-weight: 700;
        }
      `}</style>
    </tr>
  );
}
