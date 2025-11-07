import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="p-6 w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Contact Us</h1>
        <p className="mb-4 text-center text-gray-300">We’d love to hear from you!</p>
        <p className="mb-4 text-gray-400">
          Whether you have questions about our platform, need support, or just want to say hello — our team is here for you.
        </p>
        <div className="flex justify-center mb-6">
          <img 
            src="assets/logo.png" 
            alt="Contact Us" 
            className="rounded-full border-2 border-blue-500"
          />
        </div>
        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow-md">
          <p><strong className="text-white">📍 Address:</strong> <span className="text-gray-300">MCE, Paravai, Madurai – 625402, Tamil Nadu, India</span></p>
          <p><strong className="text-white">📧 Email:</strong> <a href="mailto:ragulempire2kk3@gmail.com" className="text-blue-400">ragulempire2kk3</a></p>
          <p><strong className="text-white">📞 Phone:</strong> <span className="text-blue-400">+91 7010721697 </span></p>
        </div>
        <p className="text-gray-400">
          Reach out to us via email or phone, or drop your message in the form below. We’ll get back to you as soon as possible!
        </p>
        <p className="mt-4 font-semibold text-gray-200">Your success is our mission.</p>
      </div>
    </div>
  );
};

export default ContactUs;