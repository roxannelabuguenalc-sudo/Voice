import React from 'react';
import { Recorder } from './components/Recorder';
import { Header } from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="w-full max-w-md space-y-8">
        <Header />
        <div className="bg-white py-8 px-4 shadow-2xl shadow-purple-200 rounded-3xl sm:px-10 border border-purple-100">
          <Recorder />
        </div>
        <div className="text-center text-sm text-purple-400">
          <p>© {new Date().getFullYear()} VioletVoice</p>
        </div>
      </div>
    </div>
  );
};

export default App;