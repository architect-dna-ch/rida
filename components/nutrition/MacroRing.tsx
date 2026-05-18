"use client";

interface Props {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  size?: number;
}

export default function MacroRing({
  label,
  value,
  goal,
  unit,
  color,
  size = 80,
}: Props) {
  const isOver = goal > 0 && value > goal;
  const ringColor = isOver ? "#ef4444" : color;

  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const rawPercent = goal > 0 ? value / goal : 0;
  const clampedPercent = Math.min(rawPercent, 1);
  const dashOffset = circumference * (1 - clampedPercent);

  const valueFontSize = size * 0.185;
  const unitFontSize = size * 0.135;
  const labelFontSize = size * 0.13;

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ width: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`${label}: ${value} ${unit} of ${goal} ${unit}`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
        {/* Center: value */}
        <text
          x={center}
          y={center - unitFontSize * 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text)"
          fontWeight="700"
          fontSize={valueFontSize}
          fontFamily="inherit"
        >
          {value > 9999 ? "9999+" : value}
        </text>
        {/* Center: unit */}
        <text
          x={center}
          y={center + valueFontSize * 0.75}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text2)"
          fontWeight="400"
          fontSize={unitFontSize}
          fontFamily="inherit"
        >
          {unit}
        </text>
      </svg>

      {/* Label below ring */}
      <span
        style={{
          color: "var(--text3)",
          fontSize: labelFontSize,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 500,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}
