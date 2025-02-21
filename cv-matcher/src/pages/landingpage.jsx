import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-blue-600">CV Matcher</h1>
                        </div>
                        <div>
                            <button 
                                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Login'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        Match Your CV with
                        <span className="text-blue-600"> Perfect Opportunities</span>
                    </h2>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Upload your CV and let our intelligent system match you with the best job opportunities that align with your skills and experience.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-blue-600 text-2xl mb-4">🎯</div>
                        <h3 className="text-lg font-medium text-gray-900">Smart Matching</h3>
                        <p className="mt-2 text-gray-500">
                            Our AI-powered system analyzes your CV to find the best matching job opportunities.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-blue-600 text-2xl mb-4">⚡</div>
                        <h3 className="text-lg font-medium text-gray-900">Quick Results</h3>
                        <p className="mt-2 text-gray-500">
                            Get instant matches and apply to jobs with just a few clicks.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-blue-600 text-2xl mb-4">📈</div>
                        <h3 className="text-lg font-medium text-gray-900">Career Growth</h3>
                        <p className="mt-2 text-gray-500">
                            Find opportunities that align with your career goals and growth aspirations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;