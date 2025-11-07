import React from 'react';


const Services: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="p-6 max-w-4xl w-full mx-auto bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">Our Services</h1>

        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h2 className="text-2xl font-semibold text-white">🎯 AI Mock Interviews</h2>
          <p className="text-gray-300">Simulate real interview scenarios and receive feedback on your answers, tone, and confidence level using advanced AI.</p>
        </div>

        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h2 className="text-2xl font-semibold text-white">📄 Resume Analysis & Enhancement</h2>
          <p className="text-gray-300">Upload your resume and get instant insights tailored to the job description. Identify gaps, improve phrasing, and stand out to recruiters.</p>
        </div>

        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h2 className="text-2xl font-semibold text-white">🧠 Career Coaching</h2>
          <p className="text-gray-300">One-on-one or group sessions with industry professionals to help you define your goals, build your profile, and prepare strategically.</p>
        </div>

        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h2 className="text-2xl font-semibold text-white">🎙️ Voice & Emotion Analysis</h2>
          <p className="text-gray-300">Get AI feedback on your speech patterns, tone, and facial expressions to fine-tune your communication.</p>
        </div>

        <div className="mb-6 border-l-4 border-blue-500 pl-4">
          <h2 className="text-2xl font-semibold text-white">📚 Interview Question Bank</h2>
          <p className="text-gray-300">Access curated questions for your field, updated regularly, and tailored to your experience level and desired role.</p>
        </div>

        <p className="mt-6 font-semibold text-white text-center">Let us help you prepare smart, perform confidently, and land your dream job.</p>
      </div>
    </div>
  );
};

export default Services;