import React from 'react';
import { Link } from 'react-router-dom';
import { FaUpload, FaListAlt, FaCheckCircle } from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center py-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">
          <FaCheckCircle className="w-4 h-4" />
          AI-Powered Invoice Processing
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
        Process invoices in seconds
      </h1>
      <p className="text-xl text-neutral-600 mb-8 max-w-lg mx-auto">
        Upload any PDF or photo of an invoice. Our AI extracts the details accurately.
        Designed for small businesses in Addis Ababa.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
        >
          <FaUpload className="w-5 h-5" />
          Upload Invoice
        </Link>
        <Link
          to="/invoices"
          className="inline-flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-8 py-3 rounded-2xl font-semibold hover:bg-neutral-50 transition-colors"
        >
          <FaListAlt className="w-5 h-5" />
          View My Invoices
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        {[
          { icon: FaCheckCircle, title: "Accurate Extraction", desc: "Vendor, total, line items from PDF or image" },
          { icon: FaCheckCircle, title: "Fast & Simple", desc: "Works on your phone. No training required." },
          { icon: FaCheckCircle, title: "Save & Search", desc: "All invoices stored and searchable instantly." },
        ].map((feature, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-neutral-200">
            <feature.icon className="text-success w-6 h-6 mb-3" />
            <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
            <p className="text-neutral-600 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;