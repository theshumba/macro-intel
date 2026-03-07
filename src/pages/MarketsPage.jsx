// ---------------------------------------------------------------------------
// MarketsPage.jsx — Market Monitor
// Wraps the existing MarketsView component for the routed version.
// ---------------------------------------------------------------------------

import MarketsView from '../components/MarketsView.jsx';

function MarketsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-100">Market Monitor</h1>
      <MarketsView />
    </div>
  );
}

export default MarketsPage;
