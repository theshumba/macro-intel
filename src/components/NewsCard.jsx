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

function NewsCard({ item, onSelect, isSelected, index }) {
  return (
    <article
      onClick={() => onSelect(item)}
      style={index !== undefined ? { animationDelay: `${Math.min(index * 0.05, 0.5)}s` } : undefined}
      className={`animate-card-enter bg-[#12121A] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group relative ${
        isSelected
          ? "border border-emerald-500/50 animate-pulse-glow"
          : "border border-gray-800/60 hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)]"
      }`}
    >
      {/* Impact color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        item.impactScore >= 7 ? 'bg-red-500' : item.impactScore >= 4 ? 'bg-amber-500' : 'bg-gray-600'
      }`} />
      <div className="p-5 pl-5">
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
      </div>
    </article>
  );
}

export default NewsCard;
