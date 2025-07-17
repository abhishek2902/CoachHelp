import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BotMessageSquare, Clock, Layers, ListTree } from 'lucide-react';
import { FaPlus, FaTrash, FaCode } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';

const TestSidebarMain = ({
  sections = [],
  activeSidebar,
  setActiveSidebar,
  newSectionName,
  newSectionDuration,
  setNewSectionName,
  setNewSectionDuration,
  handleRemoveSection,
  showSectionModal,
  setShowSectionModal,
  sectionQuestions,
  sectionCodingTests = {}, // <-- Default to empty object
  currentScrollIndex,
  scrollToQuestion,
  sidebaropen,
  setSidebarOpen,
  heading
}) => {
  const navigate = useNavigate();

  return (
    <>
        <aside
            id="test-sidebar-main"
            data-tour-id="sidebar-section"
            className={`mt-18 ml-8 sm:ml-15 lg:ml-5 bg-gray-100 h-[calc(100vh-80px)] fixed top-0 left-0 z-40 w-50 max-w-3xl min-w-70 rounded-2xl shadow-2xl p-5 flex flex-col justify-between transition-transform -translate-x-full lg:translate-x-0 transform duration-300 ${sidebaropen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            aria-label="Sidebar"
            onClick={() => {
              if (!sidebaropen) setSidebarOpen(!sidebaropen);
            }}
          >
          <div className="h-full overflow-y-auto bg-gray-100 flex flex-col">
            <div className="flex justify-between w-62 fixed pr-2 ">
              <button onClick={() => setSidebarOpen(!sidebaropen)} className="p-1.5 px-2 bg-gray-400 lg:bg-white text-white text-lg font-bold hover:bg-gray-600 transition duration-300 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-200" >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button type="button" className="top-1 left- z-50 inline-flex items-center p-2 text-sm text-white rounded-lg lg:hidden bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={() => setSidebarOpen(!sidebaropen)}>
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            <ul className="space-y-2 font-medium flex-1 mt-12 lg:mt-0">
              <li>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-semibold text-base ${
                    activeSidebar === 'details'
                      ? 'bg-blue-100 text-gray-900 font-bold shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveSidebar('details')}
                >
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
                  <span>{heading? heading : "Test Details"}</span>
                </button>
              </li>
              {sections.map((section, idx) => {
                const isActive = activeSidebar === section.id;
                const questions = sectionQuestions[section.id] || [];
                const codingTests = sectionCodingTests[section.id] || [];

                return (
                  <li key={section.id || idx}>
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-t-lg transition font-medium text-base  ${
                        isActive
                          ? 'bg-blue-100 text-gray-900 font-bold shadow'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-b-lg'
                      }`}
                      onClick={() => setActiveSidebar(section.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-start gap-0">
                          <span className="flex gap-3 text-sm font-semibold text-gray-800">
                            {section.is_coding_test ? (
                              <FaCode className="w-5 h-4 text-green-600" />
                            ) : (
                              <Layers className="w-5 h-4 text-gray-700" />
                            )}
                            {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name}
                            {section.is_coding_test && (
                              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                Coding
                              </span>
                            )}
                          </span>
                          {!heading&&
                            <span className="flex gap-3.5 ml-0.5 text-xs text-gray-600">
                              <Clock className="w-4 h-4 text-gray-600" />
                              {section.duration} min
                            </span>
                          }
                        </div>
                      </div>
                      <span
                        className="ml-2 text-red-600 hover:text-red-400"
                        title="Remove section"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSection(section.id);
                        }}
                      >
                        <FaTrash />
                      </span>
                    </button>

                    {/* Show questions/coding tests if this section is active */}
                    {isActive && (
                      <div className="flex flex-wrap gap-2 px-3 py-2 mt- bg-white rounded-b-lg border border-gray-200">
                        {section.is_coding_test ? (
                          // Show coding tests
                          codingTests.length > 0 ? (
                            codingTests.map((codingTest, cIdx) => {
                              const isCurrent = cIdx === currentScrollIndex;
                              return (
                                <div className='pointer cursor-pointer flex flex-col gap-1 justify-items-center' key={codingTest.id || `ct-${cIdx}`}>
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300
                                      ${isCurrent ? "bg-green-500 text-white" : "bg-green-600 text-white"}
                                    `}
                                    title={`Coding Test ${cIdx + 1}`}
                                    onClick={() => scrollToQuestion(cIdx)}
                                  >
                                    {cIdx + 1}
                                  </div>
                                  <div className={`w-7 h-1 transition duration-300 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-gray-500">No coding tests added yet.</p>
                          )
                        ) : (
                          // Show regular questions
                          questions.length > 0 ? (
                            questions.map((q, qIdx) => {
                              const isCurrent = qIdx === currentScrollIndex;
                              const isValidated = q.validation;
                              return (
                                <div className='pointer cursor-pointer flex flex-col gap-1 justify-items-center' key={q.id || `q-${qIdx}`}>
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300
                                      ${isValidated ? "bg-green-500 text-white" : "bg-gray-600 text-white"}
                                    `}
                                    title={`Q${qIdx + 1}`}
                                    onClick={() => scrollToQuestion(qIdx)}
                                  >
                                    {qIdx + 1}
                                  </div>
                                  <div className={`w-7 h-1 transition duration-300 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-gray-500">No questions added yet.</p>
                          )
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Add Button */}
            <div>
              <button
                data-tour-id="add-section"
                onClick={() => setShowSectionModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 w-full"
                type="button"
                title="Add Section"
              >
                Add/Edit Section
              </button>
            </div>
          </div>
        </aside>
        {/* Transparent Click-away Area */}
        {sidebaropen && (
          <div
            className="fixed inset-0 bg-transparent z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
    </>
  );
};

export default TestSidebarMain; 