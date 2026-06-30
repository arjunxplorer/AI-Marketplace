import Link from "next/link";

interface DemoCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  status?: "ready" | "coming-soon";
}

export default function DemoCard({
  title,
  description,
  icon,
  href,
  status = "ready",
}: DemoCardProps) {
  const isDisabled = status === "coming-soon";

  return (
    <Link
      href={isDisabled ? "#" : href}
      className={`group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
        isDisabled ? "opacity-60 cursor-not-allowed" : "hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {isDisabled && (
        <div className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          Coming Soon
        </div>
      )}

      {!isDisabled && (
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
          Try it
          <svg
            className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </Link>
  );
}
