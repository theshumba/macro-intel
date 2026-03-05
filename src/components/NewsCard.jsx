import ImpactBadge from "./ImpactBadge";
import CategoryBadge from "./CategoryBadge";

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NewsCard({ item, onSelect, isSelected }) {
  return (
    <article
      onClick={() => onSelect(item)}
      className={`bg-[#12121A] rounded-xl p-5 cursor-pointer transition-all duration-200 group ${
        isSelected
          ? "border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          : "border border-gray-800 hover:border-gray-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
      }`}
    >
      {/* Header: badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <CategoryBadge category={item.category} />
        <ImpactBadge score={item.impactScore} />
        {item.region && (
          <span className="ml-auto text-xs text-gray-500 font-medium">
            {item.region}
          </span>
        )}
      </div>

      {/* Headline */}
      <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-snug mb-2 group-hover:text-white transition-colors">
        {item.headline}
      </h3>

      {/* Summary (2 lines max) */}
      {item.summary && (
        <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2">
          {item.summary}
        </p>
      )}

      {/* Footer: source + time */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">
          {item.source || "Unknown source"}
        </span>
        <span className="tabular-nums">
          {item.publishedAt ? timeAgo(item.publishedAt) : ""}
        </span>
      </div>
    </article>
  );
}

export default NewsCard;
