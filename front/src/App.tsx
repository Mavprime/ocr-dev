import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Invoices from './pages/Invoices';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/invoices" element={<Invoices />} />
        </Routes>
      </main>

      <footer className="border-t border-neutral-200 py-6 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-neutral-500">
          Made for businesses in Addis Ababa • Powered by AI
        </div>
      </footer>
    </div>
  );
};

export default App;
