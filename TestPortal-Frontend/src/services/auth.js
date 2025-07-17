export const getToken = () => {
  return localStorage.getItem('jwt'); // or however you're storing it after login
};
