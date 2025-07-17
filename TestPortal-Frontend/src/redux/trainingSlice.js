import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { handleUnauthorized } from '../utils/handleUnauthorized';

const token = localStorage.getItem('token');
const base = import.meta.env.VITE_API_BASE_URL;

// fetchTrainingById is created using **createAsyncThunk**.
// Redux Toolkit automatically adds handlers for thunks inside extraReducers, not reducers.
export const fetchTrainingById = createAsyncThunk(
  'training/fetchById',
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`${base}/trainings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) handleUnauthorized();
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const trainingSlice = createSlice({
  name: 'training',
  initialState: {
    training: null,
    answers: {},
    res: null,
    loading: false,
    error: null,
  },
  reducers: {
    setAnswer: (state, action) => {
      const { questionId, value, questionType } = action.payload;
      if (questionType === 'MSQ') {
        const existing = state.answers[questionId] || [];
        state.answers[questionId] = existing.includes(value)
          ? existing.filter(v => v !== value)
          : [...existing, value];
      } else {
        state.answers[questionId] = value;
      }
    },
    setAnswers: (state, action) => {
      state.answers = action.payload;
    },
    clear: (state) => {
      state.training = null;
      state.answers = {};
      state.res = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingById.fulfilled, (state, action) => {
        state.training = action.payload;
        state.res = action.payload;
        state.loading = false;
      })
      .addCase(fetchTrainingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAnswer, setAnswers, clear } = trainingSlice.actions;
export default trainingSlice.reducer;
