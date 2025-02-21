const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Resume</h3>
          <div className="space-y-2 text-center">
            <p className="text-gray-600">Our AI is carefully reviewing your resume.</p>
            <p className="text-gray-600">This may take a few moments...</p>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📄</span>
              <span>Extracting skills and experience</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🤖</span>
              <span>Analyzing content with AI</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">📊</span>
              <span>Calculating resume score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 