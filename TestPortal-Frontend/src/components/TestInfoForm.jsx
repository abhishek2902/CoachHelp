export default function TestInfoForm({ title, setTitle, description, setDescription, testType, setTestType, duration, setDuration }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Test Title<span className="text-red-600">*</span></label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Duration (in min)<span className="text-red-600">*</span></label>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Test Category<span className="text-red-600">*</span></label>
        <select
          value={testType}
          onChange={e => setTestType(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="MCQ">MCQ</option>
          <option value="Theoretical">Theoretical</option>
          <option value="MSQ">MSQ</option>
          <option value="MCQ+Theoretical">MCQ+Theoretical</option>
          <option value="MCQ+MSQ">MCQ+MSQ</option>
          <option value="MSQ+Theoretical">MSQ+Theoretical</option>
          <option value="MCQ+MSQ+Theoretical">MCQ+MSQ+Theoretical</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
    </div>
  );
} 