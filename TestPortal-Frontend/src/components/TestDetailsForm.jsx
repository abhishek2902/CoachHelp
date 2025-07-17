export default function TestDetailsForm({
  title,
  setTitle,
  description,
  setDescription,
  testType,
  setTestType,
  duration,
  setDuration,
  handleSubmit,
  saving,
  isEdit
}) {
  return (
    <form className="space-y-6" onSubmit={e => { e.preventDefault(); }}>
      <h2 className="text-2xl font-bold mb-4 text-blue-700">{isEdit ? 'Edit Test Details' : 'New Test Details'}</h2>
      <div>
        <label className="block text-base font-semibold mb-1">Title<span className="text-red-600">*</span></label>
        <input className="border rounded-lg px-3 py-2 w-full text-lg" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-base font-semibold mb-1">Description</label>
        <textarea className="border rounded-lg px-3 py-2 w-full text-base" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-semibold mb-1">Type</label>
          <select className="border rounded-lg px-3 py-2 w-full text-base" value={testType} onChange={e => setTestType(e.target.value)}>
            <option value="MCQ">MCQ</option>
            <option value="MSQ">MSQ</option>
            <option value="theoretical">Theoretical</option>
          </select>
        </div>
        <div>
          <label className="block text-base font-semibold mb-1">Duration (min)</label>
          <input className="border rounded-lg px-3 py-2 w-full text-base" type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold text-base shadow"
          onClick={() => handleSubmit('draft')}
          disabled={saving}
        >
          Save as Draft
        </button>
        <button
          type="button"
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 font-semibold text-base shadow"
          onClick={() => handleSubmit('published')}
          disabled={!title || !testType || !duration}
        >
          Publish
        </button>
      </div>
    </form>
  );
} 