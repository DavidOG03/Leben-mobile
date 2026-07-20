import { useState } from "react";
import { SafeAreaView, View } from "react-native";
import AIChatPanel from "./AIChatPanel";
import AILeftPanel from "./AILeftPanel";
import AIRightPanel from "./AIRightPanel";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function AIChatBox() {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);

  return (
    <View className="flex-1 bg-leben-bg">
      {/* Top Navigation */}
      <DashboardHeader />

      {/* Main Content Area */}
      <View className="flex-1 flex-row">
        {/* Left Panel (Drawer on Mobile, fixed on Desktop) */}
        <AILeftPanel isOpen={isLeftPanelOpen} setIsOpen={setIsLeftPanelOpen} />

        {/* Center Chat Area */}
        <AIChatPanel />

        {/* Right Insights Panel */}
        <AIRightPanel />
      </View>
    </View>
  );
}
