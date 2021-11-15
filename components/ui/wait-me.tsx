import { ProgressCircle } from "@react-spectrum/progress";
import { View } from "@react-spectrum/view";

export default function WaitMe(): JSX.Element {
  return (
    <View flex justifySelf="center" alignSelf="center">
      <ProgressCircle aria-label="Loading…" isIndeterminate />
    </View>
  );
}
