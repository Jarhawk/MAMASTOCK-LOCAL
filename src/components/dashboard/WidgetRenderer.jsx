// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { lazy, Suspense } from "react";
import DashboardCard from "./DashboardCard";import { isTauri } from "@/lib/tauriEnv";

const RechartsWrapper = lazy(() => import("@/components/charts/RechartsWrapper"));

function LineWidget({ config }) {
  return (
    <Suspense fallback={null}>
      <RechartsWrapper>
        {({ ResponsiveContainer, LineChart, Line, Tooltip }) => (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={config.data || []}>
              <Line type="monotone" dataKey={config.dataKey} stroke={config.color || "#bfa14d"} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        )}
      </RechartsWrapper>
    </Suspense>
  );
}

function BarWidget({ config }) {
  return (
    <Suspense fallback={null}>
      <RechartsWrapper>
        {({ ResponsiveContainer, BarChart, Bar, Tooltip }) => (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={config.data || []}>
              <Bar dataKey={config.dataKey} fill={config.color || "#bfa14d"} />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        )}
      </RechartsWrapper>
    </Suspense>
  );
}

function PieWidget({ config }) {
  return (
    <Suspense fallback={null}>
      <RechartsWrapper>
        {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip }) => (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={config.data || []}
                dataKey={config.dataKey}
                nameKey={config.nameKey}
                outerRadius={80}
                fill={config.color || "#bfa14d"}
              >
                {(config.data || []).map((_, idx) => (
                  <Cell key={idx} fill={config.colors?.[idx % config.colors.length] || "#bfa14d"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </RechartsWrapper>
    </Suspense>
  );
}

export default function WidgetRenderer({ config }) {
  if (!config) return null;
  const type = config.type || "indicator";

  switch (type) {
    case "line":
      return <LineWidget config={config} />;
    case "bar":
      return <BarWidget config={config} />;
    case "pie":
      return <PieWidget config={config} />;
    case "list":
      return (
        <ul className="list-disc pl-4 text-sm">
          {(config.items || []).map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      );
    case "indicator":
    default:
      return <DashboardCard title={config.label} value={config.value} type={config.indicatorType} />;
  }
}
