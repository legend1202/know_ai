import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { PieChart, Pie, Cell } from "recharts";
import { IUserUsageStat } from "src/types/userUsage.interface";

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface NeedleProps {
  value: number;
  data: DataItem[];
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
}

const RADIAN = Math.PI / 180;

const cx = 150;
const cy = 200;
const iR = 50;
const oR = 100;
// const value = ;

const needle = (
  value: number,
  data: DataItem[],
  cx: number,
  cy: number,
  iR: number,
  oR: number,
  color: string
) => {
  let total = 0;
  data.forEach((v) => {
    total += v.value;
  });
  const ang = 180.0 * (value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="#none"
      fill={color}
    />,
  ];
};

interface UserUsageChartProps {
  userStats: IUserUsageStat | null;
}

const getPercentOfNumber = (percentage = 0, availableNum: number) => {
  if (!availableNum) return 0;
  return (percentage / 100) * availableNum;
};

const UserUsageChart: React.FC<UserUsageChartProps> = ({ userStats }) => {


  if (!userStats) {
    return (
      <Flex alignItems="center" justifyContent="center">
        <Text>User stats are not available</Text>
      </Flex>
    );
  }

  const data: DataItem[] = [
    {
      name: "",
      value: getPercentOfNumber(30, userStats?.maxToken),
      color: "#FF6039",
    },
    {
      name: "",
      value: getPercentOfNumber(50, userStats?.maxToken),
      color: "#3FDD78",
    },
    {
      name: "",
      value: getPercentOfNumber(20, userStats?.maxToken),
      color: "#4386F4",
    },
  ];

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <PieChart width={260} height={230} >
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          fill="#8884d8"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {needle(
          (userStats?.totalRunTokenUsed ?? 0) + (userStats?.tokenUsed ?? 0),
          data,
          cx,
          cy,
          iR,
          oR,
          "#d0d000"
        )}
      </PieChart>
      <Text fontSize="md" align="center" fontWeight="bold">
      {/* {(userStats?.totalRunTokenUsed ?? 0).toLocaleString()} / {(userStats?.maxToken ?? 0).toLocaleString()} Tokens */}
      {((userStats?.totalRunTokenUsed ?? 0) + (userStats?.tokenUsed ?? 0)).toLocaleString()} / {" ∞"} Tokens
      </Text>
    </Flex>
  );
};

export default UserUsageChart;
