import { configureStore } from '@reduxjs/toolkit';
import trainingReducer from './trainingSlice';

export const store = configureStore({
  reducer: {
    training: trainingReducer,
  },
});
