export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI Interview Prep
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Master coding interviews with AI-powered practice and personalized roadmaps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Get Started
            </button>
            <button 
              className="px-8 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your coding skills across different topics and algorithms
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Roadmap
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized study plans based on your current skill level
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Problem Suggestions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receive targeted problem recommendations to improve weak areas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}