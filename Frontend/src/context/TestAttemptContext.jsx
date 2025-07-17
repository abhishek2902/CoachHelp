import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { handleUnauthorized } from '../utils/handleUnauthorized';

//step:1 create context
//use  consume data in components
//createContext is used
export const TestAttemptContext = createContext(null);


//step2: create provider
//use to store common data and code and state, to wrap components
export const TestAttemptProvider = ({ children }) => {
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);


  // Only called once when provider mounts
  useEffect(() => {
    

    const token=localStorage.getItem('token');
    const base= import.meta.env.VITE_API_BASE_URL
    // console.log(base)

    const fetchAttemptData = async () => {
      try {
            const res = await axios.get(`${base}/test_attempts`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          setAttemptData(res.data);
      } 
      catch (err) {
        if (err.response?.status === 401) {
          // Only handle unauthorized if not on home page
          if (window.location.pathname !== '/') {
            handleUnauthorized();
          }
        } else {
          // console.error(err);
        }
      } 
      finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, []);

  return (
    <TestAttemptContext.Provider value={{ attemptData, loading }}>
      {children}
    </TestAttemptContext.Provider>
  );
};

//step 3: wrap components that need the data in context usally in app.js,(or parent file)
// always wrap all in same context to avoid multiple api calls

//step 4: consume the data in components
// useContext is used i.e component subsribe a context
//it will re-render whenever the value provided by the nearest Context.Provider above in the tree changes
