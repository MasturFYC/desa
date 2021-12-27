import { grassCostType } from "@components/interfaces";
import { useAsyncList } from "@react-stately/data";
import dynamic from "next/dynamic";
import { env } from 'process';


const GrassCostList = dynamic(() => import("./grass-cost-list"), { ssr: false });


type GrassCostProps = {
  grassId: number;
  updateTotal?: (total: number) => void;
}

function GrassCost(props: GrassCostProps): JSX.Element {
  let {grassId, updateTotal} = props;

  let costs = useAsyncList<grassCostType>({
    async load({ signal }) {
      let res = await fetch(`${env.apiKey}/grass-cost/${grassId}`, {
        signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: grassCostType) => item.id,
  });

  return (
    <GrassCostList costs={costs} grassId={grassId} updateTotal={updateTotal} />
  )

}

export default GrassCost;