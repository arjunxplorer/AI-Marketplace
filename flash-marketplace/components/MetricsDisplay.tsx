interface Metric {
  label: string;
  value: string;
  unit?: string;
}

interface MetricsDisplayProps {
  metrics: Metric[];
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {metric.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {metric.value}
            {metric.unit && (
              <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                {metric.unit}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
