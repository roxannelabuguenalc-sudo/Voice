import React from 'react';
import { MicrophoneIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <div className="text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 mb-4">
        <MicrophoneIcon className="h-8 w-8 text-purple-600" />
      </div>
      <h2 className="text-3xl font-extrabold text-purple-900 tracking-tight">
        VioletVoice
      </h2>
      <p className="mt-2 text-sm text-purple-500">
        Simple, elegant audio recording
      </p>
    </div>
  );
};