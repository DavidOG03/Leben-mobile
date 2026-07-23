import type { SvgProps } from "react-native-svg";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";

interface IconProps extends SvgProps {
  color?: string;
  size?: number | string;
}

export const EmptyIcon = ({
  color = "#2a2a2a",
  size = 36,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 36 36" fill="none" {...props}>
    <Circle
      cx="18"
      cy="18"
      r="17"
      stroke="#1e1e1e"
      strokeWidth="1.5"
      strokeDasharray="5 4"
    />
    <Path
      d="M11 18h14M18 11v14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckIcon = ({
  color = "currentColor",
  size = 10,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" fill="none" {...props}>
    <Path
      d="M1.5 5l2.5 2.5 4.5-5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SparkleIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
    <Path
      d="M7 1.5l1.3 4L12.5 7l-4.2 1.5L7 12.5l-1.3-4L1.5 7l4.2-1.5L7 1.5z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Circle cx="6.5" cy="6.5" r="5" stroke={color} strokeWidth="1.5" />
    <Path
      d="M10.5 10.5L13.5 13.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const BellIcon = ({
  color = "currentColor",
  size = 18,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M9 2a5 5 0 00-5 5v3l-1.5 2h13L14 10V7a5 5 0 00-5-5z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <Path
      d="M7 14a2 2 0 004 0"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const GearIcon = ({
  color = "currentColor",
  size = 18,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fill={color}
      d="M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-1.5 0a2.5 2.5 0 1 0-5 0a2.5 2.5 0 0 0 5 0"
    ></Path>
    <Path
      fill={color}
      d="M12 1q.4 0 .797.028c.763.055 1.345.617 1.512 1.304l.352 1.45c.019.078.09.171.225.221q.37.134.728.302c.13.061.246.044.315.002l1.275-.776c.603-.368 1.411-.353 1.99.147q.604.524 1.128 1.129c.501.578.515 1.386.147 1.99l-.776 1.274c-.042.069-.058.185.002.315q.168.357.303.728c.048.135.142.205.22.225l1.45.352c.687.167 1.249.749 1.303 1.512q.057.797 0 1.594c-.054.763-.616 1.345-1.303 1.512l-1.45.352c-.078.019-.171.09-.221.225q-.134.372-.302.728c-.061.13-.044.246-.002.315l.776 1.275c.368.603.353 1.411-.147 1.99q-.524.605-1.129 1.128c-.578.501-1.386.515-1.99.147l-1.274-.776c-.069-.042-.185-.058-.314.002a9 9 0 0 1-.729.303c-.135.048-.205.142-.225.22l-.352 1.45c-.167.687-.749 1.249-1.512 1.303q-.797.057-1.594 0c-.763-.054-1.345-.616-1.512-1.303l-.352-1.45c-.019-.078-.09-.171-.225-.221a8 8 0 0 1-.728-.302c-.13-.061-.246-.044-.315-.002l-1.275.776c-.603.368-1.411.353-1.99-.147q-.605-.524-1.128-1.129c-.501-.578-.515-1.386-.147-1.99l.776-1.274c.042-.069.058-.185-.002-.314a9 9 0 0 1-.303-.729c-.048-.135-.142-.205-.22-.225l-1.45-.352c-.687-.167-1.249-.749-1.304-1.512a11 11 0 0 1 0-1.594c.055-.763.617-1.345 1.304-1.512l1.45-.352c.078-.019.171-.09.221-.225q.134-.372.302-.728c.061-.13.044-.246.002-.315l-.776-1.275c-.368-.603-.353-1.411.147-1.99q.524-.605 1.129-1.128c.578-.501 1.386-.515 1.99-.147l1.274.776c.069.042.185.058.315-.002q.357-.168.728-.303c.135-.048.205-.142.225-.22l.352-1.45c.167-.687.749-1.249 1.512-1.304Q11.598 1 12 1m-.69 1.525c-.055.004-.135.05-.161.161l-.353 1.45a1.83 1.83 0 0 1-1.172 1.277a7 7 0 0 0-.6.249a1.83 1.83 0 0 1-1.734-.074l-1.274-.776c-.098-.06-.186-.036-.228 0a10 10 0 0 0-.976.976c-.036.042-.06.131 0 .228l.776 1.274c.314.529.342 1.18.074 1.734a7 7 0 0 0-.249.6a1.83 1.83 0 0 1-1.278 1.173l-1.45.351c-.11.027-.156.107-.16.162a10 10 0 0 0 0 1.38c.004.055.05.135.161.161l1.45.353a1.83 1.83 0 0 1 1.277 1.172q.111.306.249.6c.268.553.24 1.204-.074 1.733l-.776 1.275c-.06.098-.036.186 0 .228q.453.523.976.976c.042.036.131.06.228 0l1.274-.776a1.83 1.83 0 0 1 1.734-.075q.294.14.6.25a1.83 1.83 0 0 1 1.173 1.278l.351 1.45c.027.11.107.156.162.16a10 10 0 0 0 1.38 0c.055-.004.135-.05.161-.161l.353-1.45a1.83 1.83 0 0 1 1.172-1.278a7 7 0 0 0 .6-.248a1.83 1.83 0 0 1 1.733.074l1.275.776c.098.06.186.036.228 0q.523-.453.976-.976c.036-.042.06-.131 0-.228l-.776-1.275a1.83 1.83 0 0 1-.075-1.733q.14-.294.25-.6a1.83 1.83 0 0 1 1.278-1.173l1.45-.351c.11-.027.156-.107.16-.162a10 10 0 0 0 0-1.38c-.004-.055-.05-.135-.161-.161l-1.45-.353c-.626-.152-1.08-.625-1.278-1.172a7 7 0 0 0-.248-.6a1.83 1.83 0 0 1 .074-1.734l.776-1.274c.06-.098.036-.186 0-.228a10 10 0 0 0-.976-.976c-.042-.036-.131-.06-.228 0l-1.275.776a1.83 1.83 0 0 1-1.733.074a7 7 0 0 0-.6-.249a1.84 1.84 0 0 1-1.173-1.278l-.351-1.45c-.027-.11-.107-.156-.162-.16a10 10 0 0 0-1.38 0"
    ></Path>
  </Svg>
);

export const PlusIcon = ({
  color = "#333",
  size = 28,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...props}>
    <Circle
      cx="14"
      cy="14"
      r="13"
      stroke="#252525"
      strokeWidth="1.5"
      strokeDasharray="4 3"
    />
    <Path
      d="M14 8v12M8 14h12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const TrashIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Path
      d="M2 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M10.5 3.5l-.6 7a.5.5 0 0 1-.5.5H3.6a.5.5 0 0 1-.5-.5l-.6-7"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.5 6v3M7.5 6v3"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </Svg>
);

export const CalendarIcon = ({
  color = "currentColor",
  size = 11,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 11 11" fill="none" {...props}>
    <Rect
      x="0.75"
      y="1.5"
      width="9.5"
      height="8.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.1"
    />
    <Path d="M0.75 4.5h9.5" stroke={color} strokeWidth="1.1" />
    <Path
      d="M3.5 0.75v1.5M7.5 0.75v1.5"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </Svg>
);

export const SubtaskIcon = ({
  color = "currentColor",
  size = 11,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 11 11" fill="none" {...props}>
    <Path
      d="M2 2h7M2 5.5h5M2 9h3"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckmarkIcon = ({
  color = "white",
  size = 9,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 9 9" fill="none" {...props}>
    <Path
      d="M1.5 4.5l2 2L8 1.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CompletedCheckIcon = ({
  color = "currentColor",
  size = 11,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 11 11" fill="none" {...props}>
    <Path
      d="M1.5 5.5l2.5 2.5L9.5 2"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AllIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Rect
      x="0.75"
      y="0.75"
      width="4.5"
      height="4.5"
      rx="0.8"
      stroke={color}
      strokeWidth="1.2"
    />
    <Rect
      x="7.75"
      y="0.75"
      width="4.5"
      height="4.5"
      rx="0.8"
      stroke={color}
      strokeWidth="1.2"
    />
    <Rect
      x="0.75"
      y="7.75"
      width="4.5"
      height="4.5"
      rx="0.8"
      stroke={color}
      strokeWidth="1.2"
    />
    <Rect
      x="7.75"
      y="7.75"
      width="4.5"
      height="4.5"
      rx="0.8"
      stroke={color}
      strokeWidth="1.2"
    />
  </Svg>
);

export const ClockIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Circle cx="6.5" cy="6.5" r="5" stroke={color} strokeWidth="1.2" />
    <Path
      d="M6.5 3.5v3l2 1.5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GridIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Rect
      x="1"
      y="1"
      width="5.5"
      height="5.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.3"
    />
    <Rect
      x="8.5"
      y="1"
      width="5.5"
      height="5.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.3"
    />
    <Rect
      x="1"
      y="8.5"
      width="5.5"
      height="5.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.3"
    />
    <Rect
      x="8.5"
      y="8.5"
      width="5.5"
      height="5.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.3"
    />
  </Svg>
);

export const CheckCircleIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
    <Path
      d="M5 8l2 2 4-4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RepeatIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M2 5h9a3 3 0 010 6H2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M5 2L2 5l3 3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 8h-9a3 3 0 010-6h9"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M11 11l3 3-3 3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TrophyIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M8 11V13M5 15h6M3 2H1v2a4 4 0 003 3.87M13 2h2v2a4 4 0 01-3 3.87M5 2h6v5a3 3 0 01-6 0V2z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChartIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M2 12l4-4 3 3 5-7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TaskIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Circle cx="7.5" cy="7.5" r="6" stroke={color} strokeWidth="1.3" />
    <Path
      d="M4.5 7.5l2.2 2.2L10.5 5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HabitIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Path
      d="M2 5h9a3 3 0 010 6H2"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <Path
      d="M5 2L2 5l3 3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GoalIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Path
      d="M7.5 1.5c0 1.8-2.5 3-2.5 5.5a2.5 2.5 0 005 0c0-2.5-2.5-3.7-2.5-5.5z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <Path
      d="M3 2.5H1.5V4A3.5 3.5 0 005 7.3M12 2.5h1.5V4A3.5 3.5 0 0110 7.3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <Path
      d="M5.5 13.5h4M7.5 11v2.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </Svg>
);

export const AIIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Path
      d="M7.5 1.5l1.4 4.2L13.5 7l-4.6 1.3L7.5 13.5l-1.4-5.2L1.5 7l4.6-1.3L7.5 1.5z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AnalyticsIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none" {...props}>
    <Path
      d="M1.5 11.5l3.5-4 2.5 2.5 4-6.5 2 2.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fill={color}
      d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1l-.07 1l2.11 1.63c.19.15.25.42.12.64l-2 3.46c-.12.22-.39.31-.61.22l-2.49-1c-.52.39-1.06.73-1.69.98l-.37 2.65c-.04.24-.25.42-.5.42zm1.25-18l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.52l.37-2.61c1.19-.25 2.24-.89 3.01-1.77l2.43 1.04l.75-1.3l-2.12-1.55c.4-1.17.4-2.44 0-3.61l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4z"
    />
  </Svg>
);

export const HelpIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
    <Circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.3" />
    <Path
      d="M5.5 5.5a1.5 1.5 0 013 0c0 .8-.8 1.3-1.5 2.2"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <Circle cx="7" cy="10" r=".65" fill={color} />
  </Svg>
);

export const LogoutIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
    <Path
      d="M5.5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <Path
      d="M9.5 9.5L13 7l-3.5-2.5M13 7H5.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LightningIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Polygon
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RefreshIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M23 4v6h-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 20v-6h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EditIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon = ({
  color = "currentColor",
  size = 14,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
    <Path
      d="M2 7h10M8 3l4 4-4 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EyeIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EyeOffIcon = ({
  color = "currentColor",
  size = 16,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BoltIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Path
      d="M7.5 1L2 7.5h4.5L5 12l6.5-7H7L7.5 1z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Rect
      x="1"
      y="2"
      width="11"
      height="9.5"
      rx="1.3"
      stroke={color}
      strokeWidth="1.2"
    />
    <Path
      d="M1 5h11M4 1v2M9 1v2"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </Svg>
);

export const FocusIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Circle cx="6.5" cy="6.5" r="2" stroke={color} strokeWidth="1.2" />
    <Path
      d="M1 1v3h3M9 1h3v3M1 9v3h3M9 12h3V9"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HistoryIcon = ({
  color = "currentColor",
  size = 13,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
    <Path
      d="M1.5 6.5A5 5 0 106.5 1.5"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <Path
      d="M1.5 2v4.5H6"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 4v3l2 1"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </Svg>
);

export const LockIcon = ({
  color = "currentColor",
  size = 10,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SendIcon = ({
  color = "white",
  size = 20,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
    <Path fill={color} d="M3 20v-6l8-2l-8-2V4l19 8z" />
  </Svg>
);

export const HomeIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fill={color}
      d="M6 19h3.692v-5.077q0-.343.233-.575q.232-.233.575-.233h3q.343 0 .576.233q.232.232.232.575V19H18v-8.692q0-.154-.067-.28t-.183-.22L12.366 5.75q-.154-.134-.366-.134t-.365.134L6.25 9.808q-.115.096-.183.22t-.067.28zm-1 0v-8.692q0-.384.172-.727t.474-.565l5.385-4.078q.423-.323.966-.323t.972.323l5.385 4.077q.303.222.474.566q.172.343.172.727V19q0 .402-.299.701T18 20h-3.884q-.344 0-.576-.232q-.232-.233-.232-.576v-5.076h-2.616v5.076q0 .344-.232.576T9.885 20H6q-.402 0-.701-.299T5 19m7-6.711"
    />
  </Svg>
);

export const MoreIcon = ({
  color = "currentColor",
  size = 15,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path fill={color} d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.97.89 1.66.89H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 16H7.07L2.4 12l4.66-7H22z" />
    <Circle cx={9} cy={12} r={1.5} fill={color} />
    <Circle cx={14} cy={12} r={1.5} fill={color} />
    <Circle cx={19} cy={12} r={1.5} fill={color} />
  </Svg>
);
