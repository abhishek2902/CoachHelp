import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Check, X, Edit2, Trash2, Folder, FolderOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../admin/AdminLayout';
import {
  createTestDomain,
  getTestDomains,
  createCategory,
  getCategories,
  createMasterQuestion,
  createNestedCategory,
  getCategoryWithChildren
} from '../services/testStructure';

const CreateTestStructure = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [testDomain, setTestDomain] = useState({ name: '' });
  const [category, setCategory] = useState({ name: '', parent_id: null });
  const [masterQuestions, setMasterQuestions] = useState([]);
  
  // Created entities
  const [createdTestDomain, setCreatedTestDomain] = useState(null);
  const [createdCategory, setCreatedCategory] = useState(null);
  
  // Available options for dropdowns
  const [testDomains, setTestDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryStack, setCategoryStack] = useState([]); // for nested navigation
  const [currentCategories, setCurrentCategories] = useState([]); // for nested navigation
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);

  // Load existing data
  useEffect(() => {
    loadTestDomains();
  }, []);

  const loadTestDomains = async () => {
    try {
      const response = await getTestDomains();
      setTestDomains(response.data);
    } catch (error) {
      console.error('Error loading test domains:', error);
    }
  };

  const loadCategories = async (domainSlug) => {
    try {
      const response = await getCategories(domainSlug);
      setCategories(response.data.categories || []);
      setCurrentCategories(response.data.categories || []);
      setCategoryStack([]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Step 1: Create or Select Test Domain
  const handleTestDomainSubmit = async (e) => {
    e.preventDefault();
    if (!testDomain.name.trim()) {
      Swal.fire('Error', 'Please enter a test domain name', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await createTestDomain(testDomain);
      const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');
      const domainWithSlug = {
        ...response.data,
        slug: response.data.slug || slugify(response.data.name)
      };
      setCreatedTestDomain(domainWithSlug);
      setTestDomains([...testDomains, domainWithSlug]);
      Swal.fire('Success', 'Test Domain created successfully!', 'success');
      setCurrentStep(2);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.errors?.name?.[0] || 'Failed to create test domain', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDomainSelect = (domain) => {
    setCreatedTestDomain(domain);
    loadCategories(domain.slug);
    setCurrentStep(2);
  };

  // Step 2: Create or Select Category (root or nested)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!category.name.trim()) {
      Swal.fire('Error', 'Please enter a category name', 'error');
      return;
    }
    if (!createdTestDomain || !createdTestDomain.slug) {
      Swal.fire('Error', 'Please select or create a test domain first', 'error');
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: category.name,
        parent_id: selectedParentCategory ? selectedParentCategory.id : null
      };

      const response = await createCategory(createdTestDomain.slug, categoryData);
      setCreatedCategory(response.data);

      // Update the categories list
      if (selectedParentCategory) {
        // Add to parent's children
        const updatedCategories = categories.map(cat => {
          if (cat.id === selectedParentCategory.id) {
            return {
              ...cat,
              children: [...(cat.children || []), response.data]
            };
          }
          return cat;
        });
        setCategories(updatedCategories);
      } else {
        // Add to root categories
      setCategories([...categories, response.data]);
      }

      Swal.fire('Success', 'Category created successfully!', 'success');
      setCurrentStep(3);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.errors?.name?.[0] || 'Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Nested category navigation
  const handleCategorySelect = (selectedCategory) => {
    setCreatedCategory(selectedCategory);
    if (selectedCategory.children && selectedCategory.children.length > 0) {
      setCategoryStack([...categoryStack, selectedCategory]);
      setCurrentCategories(selectedCategory.children);
    } else {
      setCategoryStack([...categoryStack, selectedCategory]);
      setCurrentCategories([]);
    }
    setCurrentStep(3);
  };

  // Create nested category
  const handleCreateNestedCategory = (parentCategory) => {
    setSelectedParentCategory(parentCategory);
    setCategory({ name: '', parent_id: parentCategory.id });
  };

  // Step 3: Add Master Questions to selected category
  const addMasterQuestion = () => {
    setMasterQuestions([
      ...masterQuestions,
      {
        id: Date.now(),
        content: '',
        code_snippet: '',
        option_1: '',
        option_2: '',
        option_3: '',
        option_4: '',
        correct_answer: '',
        language: '',
        question_type: 'MCQ',
        marks: 1,
        isNew: true
      }
    ]);
  };

  const updateMasterQuestion = (index, field, value) => {
    const updatedQuestions = [...masterQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setMasterQuestions(updatedQuestions);
  };

  const removeMasterQuestion = (index) => {
    setMasterQuestions(masterQuestions.filter((_, i) => i !== index));
  };

  const saveMasterQuestions = async () => {
    if (masterQuestions.length === 0) {
      Swal.fire('Error', 'Please add at least one question', 'error');
      return;
    }

    // Validate all questions
    for (let i = 0; i < masterQuestions.length; i++) {
      const question = masterQuestions[i];
      if (!question.content.trim()) {
        Swal.fire('Error', `Question ${i + 1}: Content is required`, 'error');
        return;
      }
      if (question.question_type === 'MCQ' || question.question_type === 'MSQ') {
        if (!question.option_1.trim() || !question.option_2.trim() || !question.option_3.trim() || !question.option_4.trim()) {
          Swal.fire('Error', `Question ${i + 1}: All options are required`, 'error');
          return;
        }
        if (!question.correct_answer) {
          Swal.fire('Error', `Question ${i + 1}: Please select correct answer(s)`, 'error');
          return;
        }
      } else if (question.question_type === 'theoretical') {
        if (!question.correct_answer.trim()) {
          Swal.fire('Error', `Question ${i + 1}: Expected answer is required`, 'error');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const promises = masterQuestions.map(question => 
        createMasterQuestion(createdCategory.slug, {
          content: question.content,
          code_snippet: question.code_snippet,
          option_1: question.option_1,
          option_2: question.option_2,
          option_3: question.option_3,
          option_4: question.option_4,
          correct_answer: question.correct_answer,
          language: question.language,
          question_type: question.question_type,
          marks: question.marks
        })
      );

      await Promise.all(promises);
      Swal.fire('Success', 'All questions created successfully!', 'success');
      navigate('/mock'); // Redirect to mock tests page
    } catch (error) {
      Swal.fire('Error', 'Failed to create some questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Navigation for nested categories
  const goBackCategory = () => {
    if (categoryStack.length === 0) {
      setCurrentCategories(categories);
      setCreatedCategory(null);
      return;
    }
    const newStack = [...categoryStack];
    newStack.pop();
    setCategoryStack(newStack);
    if (newStack.length === 0) {
      setCurrentCategories(categories);
      setCreatedCategory(null);
    } else {
      const parent = newStack[newStack.length - 1];
      setCurrentCategories(parent.children || []);
      setCreatedCategory(parent);
    }
  };

  const steps = [
    { id: 1, title: 'Test Domain', description: 'Create or select a test domain' },
    { id: 2, title: 'Category', description: 'Create or select a category' },
    { id: 3, title: 'Master Questions', description: 'Add questions to the category' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen pt-4 px-2 sm:px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Test Structure</h1>
                <p className="text-gray-600">Build your test hierarchy step by step</p>
              </div>

              {/* Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}>
                        {currentStep > step.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-gray-300 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-6">
                {/* Step 1: Test Domain */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Create or Select Test Domain</h2>

                    {/* Create New Test Domain */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-medium mb-3">Create New Test Domain</h3>
                      <form onSubmit={handleTestDomainSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Domain Name
                          </label>
                          <input
                            type="text"
                            value={testDomain.name}
                            onChange={(e) => setTestDomain({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Programming, Mathematics, Science"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          {loading ? 'Creating...' : 'Create Test Domain'}
                        </button>
                      </form>
                    </div>

                    {/* Select Existing Test Domain */}
                    {testDomains.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">Or Select Existing Test Domain</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {testDomains.map((domain) => (
                            <button
                              key={domain.id}
                              onClick={() => handleTestDomainSelect(domain)}
                              className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
                            >
                              <p className="font-medium text-gray-900">{domain.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Category */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Create or Select Category for "{createdTestDomain?.name}"
                    </h2>

                    {/* Breadcrumb for nested navigation */}
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center space-x-2 text-sm">
                      {categoryStack.length === 0 ? (
                        <span className="text-blue-700 font-semibold">Root</span>
                      ) : (
                        <>
                          <button
                            onClick={goBackCategory}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ← Back
                          </button>
                          {categoryStack.map((cat, idx) => (
                            <React.Fragment key={cat.id}>
                              <span className="text-gray-500">/</span>
                              <span className="ml-2 text-gray-700">{cat.name}</span>
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Drilldown: Show only current level categories */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">
                        {categoryStack.length === 0 ? 'Root Categories' : `Subcategories of "${categoryStack[categoryStack.length-1].name}"`}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {currentCategories.length === 0 && (
                          <div className="text-gray-500 italic">No subcategories at this level.</div>
                        )}
                        {currentCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCategoryStack([...categoryStack, cat]);
                              setCurrentCategories(cat.children || []);
                              setSelectedParentCategory(cat); // For subcategory creation
                            }}
                            className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left bg-white"
                          >
                            <div className="flex items-center">
                              {cat.children && cat.children.length > 0 ? (
                                <FolderOpen className="w-4 h-4 mr-2 text-blue-600" />
                              ) : (
                                <Folder className="w-4 h-4 mr-2 text-gray-600" />
                              )}
                              <span className="font-medium text-gray-900">{cat.name}</span>
                            </div>
                            {cat.children && cat.children.length > 0 && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                {cat.children.length} subcategories
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Create New Category/Subcategory at current level */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-medium mb-3">
                        Create New {categoryStack.length === 0 ? 'Category' : 'Subcategory'}
                        {categoryStack.length > 0 && ` in "${categoryStack[categoryStack.length-1].name}"`}
                      </h3>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {categoryStack.length === 0 ? 'Category' : 'Subcategory'} Name
                          </label>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => setCategory({ ...category, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={categoryStack.length === 0 ? "e.g., Web Development, Data Science" : "e.g., React, Angular"}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          {loading ? 'Creating...' : `Create ${categoryStack.length === 0 ? 'Category' : 'Subcategory'}`}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Step 3: Master Questions */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Add Master Questions to "{createdCategory?.name}"
                    </h2>

                    <div className="space-y-6">
                      {masterQuestions.map((question, index) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Question {index + 1}</h3>
                            <button
                              onClick={() => removeMasterQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Content *
                              </label>
                              <textarea
                                value={question.content}
                                onChange={(e) => updateMasterQuestion(index, 'content', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Enter your question here..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Programming Language (Optional)
                              </label>
                              <input
                                type="text"
                                value={question.language}
                                onChange={(e) => updateMasterQuestion(index, 'language', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Ruby, Python, JavaScript"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                              </label>
                              <select
                                value={question.question_type}
                                onChange={(e) => updateMasterQuestion(index, 'question_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="MCQ">MCQ</option>
                                <option value="MSQ">MSQ</option>
                                <option value="theoretical">Theoretical</option>
                              </select>
                            </div>
                            {/* MCQ/MSQ: Show options and correct answer */}
                            {(question.question_type === 'MCQ' || question.question_type === 'MSQ') && (
                              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((optionNum) => (
                                  <div key={optionNum}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Option {optionNum} *
                                    </label>
                                    <input
                                      type="text"
                                      value={question[`option_${optionNum}`]}
                                      onChange={(e) => updateMasterQuestion(index, `option_${optionNum}`, e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={`Enter option ${optionNum}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* MCQ: Single correct answer */}
                            {question.question_type === 'MCQ' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Correct Answer *
                                </label>
                                <select
                                  value={question.correct_answer}
                                  onChange={(e) => updateMasterQuestion(index, 'correct_answer', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select correct answer</option>
                                  <option value="1">Option 1</option>
                                  <option value="2">Option 2</option>
                                  <option value="3">Option 3</option>
                                  <option value="4">Option 4</option>
                                </select>
                              </div>
                            )}
                            {/* MSQ: Multiple correct answers */}
                            {question.question_type === 'MSQ' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Correct Answers * (Select one or more)
                                </label>
                                <div className="flex gap-4">
                                  {[1, 2, 3, 4].map((optionNum) => (
                                    <label key={optionNum} className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={question.correct_answer?.split(',').includes(optionNum.toString())}
                                        onChange={(e) => {
                                          let current = question.correct_answer ? question.correct_answer.split(',') : [];
                                          if (e.target.checked) {
                                            if (!current.includes(optionNum.toString())) current.push(optionNum.toString());
                                          } else {
                                            current = current.filter((v) => v !== optionNum.toString());
                                          }
                                          updateMasterQuestion(index, 'correct_answer', current.join(','));
                                        }}
                                      />
                                      Option {optionNum}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Theoretical: Expected answer */}
                            {question.question_type === 'theoretical' && (
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expected Answer *
                                </label>
                                <textarea
                                  value={question.correct_answer}
                                  onChange={(e) => updateMasterQuestion(index, 'correct_answer', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Enter expected answer..."
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marks *
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={question.marks}
                                onChange={(e) => updateMasterQuestion(index, 'marks', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter marks for this question"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addMasterQuestion}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Another Question
                      </button>

                      {masterQuestions.length > 0 && (
                        <button
                          onClick={saveMasterQuestions}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Saving Questions...' : 'Save All Questions'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
};

export default CreateTestStructure;