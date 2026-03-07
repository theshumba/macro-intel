// ---------------------------------------------------------------------------
// EventsPage.jsx — Full event list with filtering
// ---------------------------------------------------------------------------

import EventCard from '../components/EventCard.jsx';

function EventsPage({ events, filters, onFilterChange, onSelectEvent, selectedEventId }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">All Events</h1>
        <span className="text-sm text-gray-500">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No events match your filters.</p>
          <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event, i) => (
            <EventCard
              key={event.eventId}
              event={event}
              onSelect={onSelectEvent}
              isSelected={event.eventId === selectedEventId}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsPage;
