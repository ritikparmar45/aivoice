import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AppContext = createContext();

// Default local backend url, can be overridden by environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AppProvider = ({ children }) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const resetState = () => {
    setCurrentFile(null);
    setUploadProgress(0);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
  };

  const uploadAndAnalyzeFile = async (file) => {
    if (!hasConsent) {
      setError('Explicit user consent is required before uploading files.');
      return;
    }

    setCurrentFile(file);
    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('consent', 'true');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Check if total is available to calculate percentage
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          } else {
            setUploadProgress(50); // fallback placeholder during upload
          }
        },
      });

      if (response.data && response.data.status === 'success') {
        setAnalysisResult(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to analyze pronunciation.');
      }
    } catch (err) {
      console.error('Error uploading/analyzing file:', err);
      const msg = err.response?.data?.message || err.message || 'An error occurred during analysis.';
      setError(msg);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        hasConsent,
        setHasConsent,
        currentFile,
        setCurrentFile,
        uploadProgress,
        isAnalyzing,
        analysisResult,
        setAnalysisResult,
        error,
        setError,
        uploadAndAnalyzeFile,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
export default AppContext;
