import axiosInstance from '../api/axiosInstance';

// Test Domain APIs
export const createTestDomain = (data) => {
  return axiosInstance.post('/test_domains', { test_domain: data });
};

export const getTestDomains = () => {
  return axiosInstance.get('/test_domains');
};

export const getTestDomain = (slug) => {
  return axiosInstance.get(`/test_domains/${slug}`);
};

// Category APIs
export const createCategory = (testDomainSlug, data) => {
  return axiosInstance.post(`/test_domains/${testDomainSlug}/categories`, { category: data });
};

export const getCategories = (testDomainSlug) => {
  return axiosInstance.get(`/test_domains/${testDomainSlug}`);
};

// Nested Category APIs
export const createNestedCategory = (testDomainSlug, data) => {
  return axiosInstance.post(`/test_domains/${testDomainSlug}/categories`, { category: data });
};

export const getCategoryWithChildren = (categorySlug) => {
  return axiosInstance.get(`/categories/${categorySlug}`);
};

// Master Question APIs (now use categorySlug)
export const createMasterQuestion = (categorySlug, data) => {
  return axiosInstance.post(`/categories/${categorySlug}/master_questions`, { master_question: data });
};

export const getMasterQuestions = (categorySlug) => {
  return axiosInstance.get(`/categories/${categorySlug}/master_questions`);
};