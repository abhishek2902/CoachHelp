import { useState } from "react";

export default function TestStepper({ steps, children }) {
  const [current, setCurrent] = useState(0);

  const goNext = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const goBack = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center">
            <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${idx === current ? 'bg-blue-700' : 'bg-gray-400'}`}>{idx + 1}</div>
            <span className={`ml-2 mr-4 font-semibold ${idx === current ? 'text-blue-700' : 'text-gray-500'}`}>{step}</span>
            {idx < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 rounded" />}
          </div>
        ))}
      </div>
      <div className="mb-6">{Array.isArray(children) ? children[current] : children}</div>
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={goBack}
          disabled={current === 0}
          className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={current === steps.length - 1}
          className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 