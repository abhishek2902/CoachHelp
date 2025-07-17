import React from 'react';

const TestPreview = ({ title, description, sections, sectionQuestions }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 h-full overflow-y-auto shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{title || 'Untitled Test'}</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">{description || 'No description provided.'}</p>
      {sections.length === 0 ? (
        <div className="text-gray-400 italic">No sections yet.</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={section.id || idx} className="border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg text-blue-700 dark:text-blue-300">Section {idx + 1}:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{section.name}</span>
                <span className="ml-2 text-xs text-gray-500">({section.duration} min)</span>
              </div>
              <div className="ml-4 max-h-48 overflow-y-auto pr-2">
                {sectionQuestions[section.id]?.length > 0 ? (
                  <ol className="list-decimal ml-4 space-y-2">
                    {sectionQuestions[section.id].map((q, qIdx) => (
                      <li key={q.id || qIdx} className="text-gray-800 dark:text-gray-200">
                        <div className="font-medium">Q{qIdx + 1}: <span dangerouslySetInnerHTML={{ __html: q.content || '' }} /></div>
                        <div className="ml-2 text-sm">
                          {q.question_type && <span className="mr-2">Type: <span className="font-semibold">{q.question_type}</span></span>}
                          {q.marks && <span className="mr-2">Marks: <span className="font-semibold">{q.marks}</span></span>}
                          {q.tags && <span className="mr-2">Tags: <span className="font-semibold">{q.tags}</span></span>}
                        </div>
                        {(q.question_type === 'MCQ' || q.question_type === 'MSQ') && (
                          <ul className="ml-4 mt-1 list-disc text-gray-700 dark:text-gray-300">
                            {[1,2,3,4].map(num => (
                              q[`option_${num}`] ? (
                                <li key={num} className={((q.question_type === 'MCQ' && q.correct_answer === String(num)) || (q.question_type === 'MSQ' && (q.correct_answer || '').split(',').includes(String(num)))) ? 'font-semibold text-green-700 dark:text-green-400' : ''}>
                                  <span dangerouslySetInnerHTML={{ __html: q[`option_${num}`] }} />
                                  {((q.question_type === 'MCQ' && q.correct_answer === String(num)) || (q.question_type === 'MSQ' && (q.correct_answer || '').split(',').includes(String(num)))) && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct)</span>
                                  )}
                                </li>
                              ) : null
                            ))}
                          </ul>
                        )}
                        {q.question_type === 'theoretical' && q.correct_answer && (
                          <div className="ml-4 mt-1 text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Expected Answer:</span> <span dangerouslySetInnerHTML={{ __html: q.correct_answer }} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-gray-400 italic">No questions in this section.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestPreview; 