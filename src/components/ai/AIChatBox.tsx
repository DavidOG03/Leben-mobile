import { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import AITopBar from './AITopBar';
import AILeftPanel from './AILeftPanel';
import AIChatPanel from './AIChatPanel';
import AIRightPanel from './AIRightPanel';

export default function AIChatBox() {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-leben-bg">
      {/* Top Navigation */}
      <AITopBar toggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)} />

      {/* Main Content Area */}
      <View className="flex-1 flex-row">
        {/* Left Panel (Drawer on Mobile, fixed on Desktop) */}
        <AILeftPanel isOpen={isLeftPanelOpen} setIsOpen={setIsLeftPanelOpen} />
        
        {/* Center Chat Area */}
        <AIChatPanel />

        {/* Right Insights Panel */}
        <AIRightPanel />
      </View>
    </SafeAreaView>
  );
}
