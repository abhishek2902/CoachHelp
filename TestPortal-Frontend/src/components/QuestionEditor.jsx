import RichEditor from './RichEditor';
import { FaTrash, FaCheckCircle, FaRegCircle, FaRegSquare } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { useRef } from 'react';

export default function QuestionEditor({ question, idx, sectionId, onChange, onRemove, saving, handleUpdateTest }) {
  const debouncedUpdate = useRef(handleUpdateTest ? debounce(handleUpdateTest, 1500) : null).current;
  const isMCQ = question.question_type?.toUpperCase() === 'MCQ';
  const isMSQ = question.question_type?.toUpperCase() === 'MSQ';
  const isTheoretical = question.question_type?.toLowerCase() === 'theoretical';

  const handleCorrectAnswer = (num) => {
    if (isMCQ) {
      onChange(sectionId, idx, 'correct_answer', question.correct_answer === String(num) ? '' : String(num));
    } else if (isMSQ) {
      let arr = (question.correct_answer || '').split(',').filter(Boolean);
      arr = arr.includes(String(num))
        ? arr.filter(n => n !== String(num))
        : [...arr, String(num)];
      onChange(sectionId, idx, 'correct_answer', arr.join(','));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-1 relative min-w-full md:min-w-[600px] snap-start">
      {/* Header Row */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-base font-semibold">Q{idx + 1}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm w-full md:w-auto">
          <div>
            <label className="text-gray-600 mr-1">Type:</label>
            <select
              className="rounded-md border border-gray-300 bg-white px-0.5 py-1 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm w-20 h-8"
              value={question.question_type}
              onChange={e => onChange(sectionId, idx, 'question_type', e.target.value)}
              disabled={saving}
            >
              <option value="MCQ">MCQ</option>
              <option value="MSQ">MSQ</option>
              <option value="theoretical">Theoretical</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 mr-1">Marks:</label>
            <input
              type="number"
              className="rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm w-20 h-8"
              value={question.marks}
              onChange={e => {
                const val = e.target.value;
                if (val <= 999) {
                  onChange(sectionId, idx, 'marks', val);
                }
              }}
              disabled={saving}
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-600 mr-1">Tags:</label>
            <input
              type="text"
              className="rounded-md border border-gray-300 bg-white px-0.5 py-1 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm w-20 h-8"
              value={question.tags || ''}
              onChange={e => onChange(sectionId, idx, 'tags', e.target.value)}
              disabled={saving}
              placeholder="React, Ruby"
              maxLength={20}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(sectionId, idx)}
            className="text-red-600 hover:text-red-400 ml-auto"
            disabled={saving}
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div onBlur={() => handleUpdateTest?.()} >
        <label htmlFor={`question-content-${sectionId}-${idx}`} className="block font-medium mb-1">Question</label>
        <RichEditor
          value={question.content}
          onChange={val => onChange(sectionId, idx, 'content', val)}
          placeholder="Enter question..."
        />
      </div>

      {/* Options for MCQ/MSQ */}
      {(isMCQ || isMSQ) && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(num => {
              const checked = isMCQ
                ? question.correct_answer === String(num)
                : (question.correct_answer || '').split(',').includes(String(num));

              return (
                <div key={num} className="flex items-start gap-2 mb-4">
                  <button
                    type="button"
                    onClick={
                      () => {
                        handleCorrectAnswer(num)
                        handleUpdateTest?.()
                      }
                    }
                    className="mt-1 text-sm focus:outline-none"
                    title={checked ? 'Correct' : 'Mark as correct'}
                  >
                    {checked ? (
                      <FaCheckCircle className="text-green-600 w-4 h-4" />
                    ) : isMCQ ? (
                      <FaRegCircle className="text-gray-400 w-4 h-4" />
                    ) : (
                      <FaRegSquare className="text-gray-400 w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1" onBlur={() => handleUpdateTest?.()}>
                    <label htmlFor={`question-${sectionId}-${idx}-option-${num}`} className="block font-medium mb-1">Option {num}</label>
                    <RichEditor
                      value={question[`option_${num}`]}
                      onChange={val => onChange(sectionId, idx, `option_${num}`, val)}
                      placeholder={`Enter option ${num}...`}
                      className="option-editor"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Theoretical expected answer */}
      {isTheoretical && (
        <div onBlur={() => handleUpdateTest?.()}>
          <label htmlFor={`question-${sectionId}-${idx}-expected-answer`} className="block font-medium mb-1">Expected Answer</label>
          <RichEditor
            value={question.correct_answer}
            onChange={val => onChange(sectionId, idx, 'correct_answer', val)}
            placeholder="Enter expected answer..."
          />
        </div>
      )}
    </div>
  );
}

