import { grassCostType } from "@components/interfaces";
import { useAsyncList } from "@react-stately/data";
import dynamic from "next/dynamic";


const GrassCostList = dynamic(() => import("./grass-cost-list"), { ssr: false });


type GrassCostProps = {
  grassId: number
}

function GrassCost(props: GrassCostProps): JSX.Element {
  let {grassId} = props;

  let costs = useAsyncList<grassCostType>({
    async load({ signal }) {
      let res = await fetch(`/api/grass-cost/${grassId}`, {
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
    <GrassCostList costs={costs} grassId={grassId} />
  )

}

export default GrassCost;