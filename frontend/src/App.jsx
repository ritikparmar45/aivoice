import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(224, 25%, 10%)',
            color: 'hsl(210, 40%, 98%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </AppProvider>
  );
}
