import { FaPlus, FaTrash } from 'react-icons/fa';

export default function TestSidebar({
  sections,
  activeSidebar,
  setActiveSidebar,
  newSectionName,
  setNewSectionName,
  handleAddSection,
  handleRemoveSection
}) {
  return (
    <aside className="w-64 flex-shrink-0 pr-6 sticky top-0 h-[calc(100vh-64px)]" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col border border-blue-100">
        <ul className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <li>
            <button
              className={`w-full flex items-center px-4 py-2 rounded-lg transition font-semibold text-base shadow-sm border border-transparent ${activeSidebar === 'details' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              onClick={() => setActiveSidebar('details')}
            >
              Test Details
            </button>
          </li>
          {sections.map(section => (
            <li key={section.id}>
              <button
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition font-medium text-base shadow-sm border border-transparent ${activeSidebar === section.id ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                onClick={() => setActiveSidebar(section.id)}
              >
                <span>{section.name}</span>
                <span className="ml-2 text-red-400 hover:text-red-600" title="Remove section" onClick={e => { e.stopPropagation(); handleRemoveSection(section.id); }}><FaTrash /></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <div className="flex gap-2">
            <input
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              placeholder="Add new section"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSection(); } }}
            />
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              onClick={handleAddSection}
              type="button"
              title="Add Section"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
} 