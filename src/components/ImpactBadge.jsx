function ImpactBadge({ score }) {
  const numScore = Number(score) || 0;

  let colorClasses, label;

  if (numScore >= 7) {
    colorClasses = "bg-red-500/20 text-red-400 border-red-500/30";
    label = "High";
  } else if (numScore >= 4) {
    colorClasses = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    label = "Medium";
  } else {
    colorClasses = "bg-gray-500/20 text-gray-400 border-gray-500/30";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      <span className="tabular-nums">{numScore}</span>
      <span>{label}</span>
    </span>
  );
}

export default ImpactBadge;
