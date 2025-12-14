import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { EventEditor } from './components/EventEditor';
import { EventData, CashRegister, StartEntry } from './types';

// Migration helper for old data format
const migrateEvent = (data: any): EventData => {
  if (data.registers && Array.isArray(data.registers)) {
    return data as EventData;
  }

  // Migrate from old format (endCashRegister1/2) to new format (registers array)
  const registers: CashRegister[] = [
    { id: '1', name: 'Kasse 1', endAmount: Number(data.endCashRegister1) || 0 },
    { id: '2', name: 'Kasse 2', endAmount: Number(data.endCashRegister2) || 0 }
  ];

  const startEntries = (data.startEntries || []).map((entry: any) => ({
    ...entry,
    registerId: entry.register ? entry.register.toString() : '1' // Default to 1 if missing
  }));

  return {
    ...data,
    registers,
    startEntries,
    expenses: data.expenses || [] // Ensure expenses exist
  };
};

function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('landjugend-events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migratedEvents = parsed.map(migrateEvent);
          setEvents(migratedEvents);
        }
      } catch (e) {
        console.error("Failed to parse events", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('landjugend-events', JSON.stringify(events));
  }, [events]);

  const handleCreateEvent = () => {
    setSelectedEventId(null);
    setView('editor');
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setView('editor');
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Möchten Sie diese Veranstaltung wirklich löschen?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSaveEvent = (eventData: EventData) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === eventData.id);
      if (index >= 0) {
        const newEvents = [...prev];
        newEvents[index] = eventData;
        return newEvents;
      } else {
        return [...prev, eventData];
      }
    });
    setView('dashboard');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const imported = JSON.parse(result);
        if (Array.isArray(imported)) {
          // Merge strategy: Add ones that don't exist by ID, and migrate format
          setEvents(prev => {
             const existingIds = new Set(prev.map(ev => ev.id));
             const newUnique = imported
               .filter((ev: any) => !existingIds.has(ev.id))
               .map(migrateEvent);
             return [...prev, ...newUnique];
          });
          alert(`${imported.length} Datensätze geprüft, Import erfolgreich.`);
        }
      } catch (err) {
        alert("Fehler beim Importieren der Datei.");
      }
    };
    reader.readAsText(file);
  };

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) || null : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {view === 'dashboard' ? (
        <Dashboard
          events={events}
          onCreateEvent={handleCreateEvent}
          onSelectEvent={handleSelectEvent}
          onDeleteEvent={handleDeleteEvent}
          onImport={handleImport}
        />
      ) : (
        <EventEditor
          initialData={selectedEvent}
          onSave={handleSaveEvent}
          onBack={() => setView('dashboard')}
        />
      )}
    </div>
  );
}

export default App;