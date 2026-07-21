import React from 'react';
import { View, } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { ProductivityData } from '@/utils/analytics.utils';
import { Text } from '@/components/ui/Text';


export function TrendLine({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const norm = (v: number) => ((v - min) / (max - min || 1)) * 40 + 5;
  const w = 120;
  
  // Guard against empty array
  if (data.length === 0) {
    return <Svg width={w} height={55} viewBox={`0 0 ${w} 55`} fill="none" />;
  }
  
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${50 - norm(v)}`).join(' ');

  return (
    <Svg width={w} height={55} viewBox={`0 0 ${w} 55`} fill="none">
      <Polyline
        points={points}
        stroke="#7c6af0"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <Polyline
        points={`0,55 ${points} ${w},55`}
        stroke="none"
        fill="rgba(124,106,240,0.08)"
      />
    </Svg>
  );
}

interface Props {
  data: ProductivityData;
  hasData: boolean;
}

export function ProductivityScore({ data, hasData }: Props) {
  return (
    <View className="rounded-2xl p-5 mb-5 bg-leben-bg-card border border-leben-border">
      <Text className="font-semibold text-leben-text-2 mb-1 text-[14px]">
        Productivity Score
      </Text>
      <Text className="text-[11px] text-leben-text-muted mb-4">
        7-day efficiency trend
      </Text>

      <View className="flex-row items-end justify-between gap-2">
        <View>
          <Text className="font-black text-leben-text-2 text-[36px] -tracking-[1px] leading-[40px]">
            {data.score} %
          </Text>
          <Text className="text-[11px] text-leben-accent mt-1">
            Based on {data.taskCount} tasks & {data.habitCount} habits
          </Text>
        </View>
        <TrendLine data={data.trend} />
      </View>
    </View>
  );
}
