import AIChatBox from "@/components/ai/AIChatBox";
import { ScreenLayout } from "@/components/shared/ScreenLayout";

export default function AIScreen() {
  return (
    <ScreenLayout scrollable={false}>
      <AIChatBox />
    </ScreenLayout>
  );
}
