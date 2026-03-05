const CATEGORY_COLORS = {
  "Monetary Policy": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Trade & Tariffs": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Sanctions": "bg-red-500/20 text-red-400 border-red-500/30",
  "Energy Markets": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Commodities": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "FX": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Equities": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Sovereign Risk": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Emerging Markets": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Multilateral": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Markets": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Mixed": "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const DEFAULT_COLOR = "bg-gray-500/20 text-gray-400 border-gray-500/30";

function CategoryBadge({ category }) {
  const colorClasses = CATEGORY_COLORS[category] || DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      {category}
    </span>
  );
}

export default CategoryBadge;
