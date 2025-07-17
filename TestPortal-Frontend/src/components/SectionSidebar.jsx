export default function SectionSidebar({ sections, selectedSection, setSelectedSection, newSectionName, setNewSectionName, handleAddSection }) {
  return (
    <aside className="w-full md:w-64 bg-white border-r p-4 flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2">Sections</h3>
      <div className="flex flex-col gap-2">
        {sections.map(section => (
          <button
            key={section.id}
            className={`text-left px-3 py-2 rounded transition font-semibold ${selectedSection === section.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-blue-100'}`}
            onClick={() => setSelectedSection(section.id)}
          >
            {section.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newSectionName}
          onChange={e => setNewSectionName(e.target.value)}
          placeholder="Add section"
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          type="button"
          onClick={handleAddSection}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </aside>
  );
} 