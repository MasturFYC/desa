import { dateParam, grassCostType } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { FormatNumber } from "@lib/format";
import { AsyncListData } from "@react-stately/data";
import { ActionButton } from "@react-spectrum/button";
import PinAdd from "@spectrum-icons/workflow/Add";
import PinRemove from "@spectrum-icons/workflow/Remove";
import { useState } from "react";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import useClickOutside from "@components/ui/use-outside-click";

const initData: grassCostType = {
  grassId: 0,
  id: 0,
  memo: '',
  qty: 1,
  price: 0,
  subtotal: 0,
  createdAt: dateParam(null),
  updatedAt: dateParam(null)
}

type GrassCostListProps = {
  grassId: number;
  costs: AsyncListData<grassCostType>
}
function GrassCostList(props: GrassCostListProps): JSX.Element {
  let { costs, grassId } = props;
  let [selectedCost, setSelectedCost] = useState<number>(-1);
  let [data, setData] = useState<grassCostType>({} as grassCostType)
  let { ref, isComponentVisible } = useClickOutside<HTMLTableElement>(true, () => {
    setSelectedCost(-1)
  });

  return (
    <table ref={ref}>
      <thead>
        <tr>
          <th className={'text-left static-width'}>ID</th>
          <th className={'text-left memo-width'}>MEMO</th>
          <th className={'text-right qty-width'}>QTY</th>
          <th className={'text-right'}>HARGA</th>
          <th className={'text-right'}>SUBTOTAL</th>
          <th className={'text-right static-width'}>{' '}</th>
        </tr>
      </thead>
      <tbody>
        {costs.isLoading ? <WaitMe /> :
          [...costs.items, { ...initData, grassId: grassId }].map((cost, index) => (
            selectedCost === cost.id ?
              (<tr>
                <td>{data.id}</td>
                <td>
                  <TextField isQuiet width={'100%'} autoFocus aria-label={'Cost-memo'} value={data.memo} onChange={(e) => setData(o => ({ ...o, memo: e }))} />
                </td>
                <td className={'text-right'}>
                  <NumberField isQuiet width={'100%'} hideStepper aria-label={'Cost-qty'} value={data.qty} onChange={(e) => setData(o => ({ ...o, qty: e, subtotal: e * o.price }))} />
                </td>
                <td className={'text-right'}>
                  <NumberField isQuiet width={'100%'} hideStepper aria-label={'Cost-price'} value={data.price} onChange={(e) => setData(o => ({ ...o, price: e, subtotal: o.qty * e }))} />
                </td>
                <td className={'text-right'}>
                  <NumberField isQuiet width={'100%'} hideStepper isReadOnly aria-label={'Cost-price'} value={data.subtotal} onChange={(e) => setData(o => ({ ...o, subtotal: e }))} />
                </td>
                <td>
                  {data.id === 0 && <ActionButton isQuiet flex
                    margin={0}
                    height={'auto'}
                    onPress={(e) => {
                      costs.insert(costs.items.length, { ...data, id: costs.items.length + 1 })
                      setData({ ...initData, grassId: grassId })
                    }}
                  >
                    <PinAdd size={'S'} />
                  </ActionButton>}
                  {data.id > 0 && <ActionButton isQuiet onPress={() => costs.remove(data.id)} height={'auto'} flex
                    margin={0}
                  >
                    <PinRemove size={'S'} />
                  </ActionButton>}

                </td>
              </tr>) :
              <tr key={cost.id}
                className={index % 2 === 0 ? 'row-even' : undefined}
                onClick={() => {
                  setSelectedCost(cost.id)
                  setData(cost)
                }}>
                <td>{cost.id}</td>
                <td>{cost.memo}</td>
                <td className={'text-right'}>{FormatNumber(cost.qty)}</td>
                <td className={'text-right'}>{FormatNumber(cost.price)}</td>
                <td className={'text-right text-bold'}>{FormatNumber(cost.subtotal)}</td>
                <td>
                  {cost.id != 0 &&
                    <ActionButton isQuiet onPress={() => costs.remove(cost.id)} height={'auto'} flex
                      margin={0}
                    >
                      <PinRemove size={'S'} />
                    </ActionButton>}
                </td>
              </tr>
          ))
        }
      </tbody>
      <tfoot>
        <tr>
          <td className={'text-left'} colSpan={4}>TOTAL: ({costs.items.length} items)</td>
          <td className={'text-right text-bold'}>{FormatNumber(costs.items.reduce((a, b) => a + b.subtotal, 0))}</td>
          <td>{' '}</td>
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
  }
  thead, tfoot {
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
    padding: 8px 6px;;
  }
  td {
    padding: 3px 6px;
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
  )
}

export default GrassCostList;

