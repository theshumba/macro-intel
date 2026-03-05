import NewsCard from "./NewsCard";

function NewsList({ items, onSelect, selectedId }) {
  const sorted = [...(items || [])].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return (
    <div>
      {/* Item count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          <span className="text-gray-200 font-semibold tabular-nums">
            {sorted.length}
          </span>{" "}
          {sorted.length === 1 ? "item" : "items"}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <span className="text-4xl mb-3">&#x2205;</span>
          <p className="text-sm font-medium">No items match your filters</p>
          <p className="text-xs mt-1 text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              isSelected={selectedId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsList;
