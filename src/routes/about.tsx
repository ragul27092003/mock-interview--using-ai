import {motion} from 'framer-motion'
const About = () => {
    return (
        <div className="bg-black text-white min-h-screen flex flex-col">

        {/* Animated Hero Banner */}
        <motion.div
          className="bg-blue-900 text-white py-12 px-6 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold mb-2">About Interviews Copilot</h1>
          <p className="text-lg">Smarter Prep. Greater Confidence. Real Results.</p>
        </motion.div>
  
        {/* Animated Main Content */}
        <motion.div
          className="p-6 max-w-5xl w-full mx-auto bg-neutral-900 rounded-lg shadow-lg mt-10 mb-10 flex-grow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.img
              src="https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80"
              alt="AI Interview Illustration"
              className="w-full md:w-1/2 rounded-lg shadow-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="md:w-1/2"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">Why We Exist 💡</h2>
              <p className="mb-4">
                At <span className="font-semibold text-blue-400">Interviews Copilot</span>, we believe in smarter preparation for a brighter future.
              </p>
              <p className="mb-4">
                We help users simulate real interviews, receive instant feedback, and improve their tone, delivery, and confidence.
              </p>
            </motion.div>
          </div>
  
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">🎯 Our Mission</h2>
            <ul className="list-disc list-inside ml-4 text-lg space-y-1">
              <li>⚡ More efficient</li>
              <li>🔍 More insightful</li>
              <li>🎯 More personalized</li>
            </ul>
          </motion.div>
  
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">🚀 Our Vision</h2>
            <p className="mb-4">
              Founded by developers passionate about tech and career growth, we blend AI with real-world hiring needs — helping candidates stand out.
            </p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-300">
              "Smart Prep, Confident You" isn’t just a tagline. It’s our promise.
            </blockquote>
          </motion.div>
        </motion.div>
      </div>
    )
  }
  export default About;
  