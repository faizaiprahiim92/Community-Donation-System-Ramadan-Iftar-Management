interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb: BreadcrumbItem[];
}

export default function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-2">
      <nav className="mb-1 flex items-center gap-1 text-xs text-gray-400">
        {breadcrumb.map((item, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="transition-colors hover:text-gray-600"
                >
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? "text-gray-600 font-medium" : ""}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="mt-0.5 text-xs sm:text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
