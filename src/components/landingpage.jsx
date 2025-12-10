import { useNavigate } from 'react-router-dom';
import Footer from './footer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/logo-picture/bg-landing.avif)",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">

        {/* HERO TITLE (FIXED + RESPONSIVE) */}
        <div className="flex flex-col items-center gap-4 mb-6">

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <img 
              src="/logo-picture/2nd-logo.jpg"
              alt="BoardEase" 
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-full"
            />

            <h1
              className="
                text-3xl        /* mobile */
                sm:text-5xl     /* small screens */
                md:text-6xl     /* tablets */
                lg:text-7xl     /* desktop */
                font-bold text-white leading-tight
              "
            >
              Welcome to <span className="text-white">BoardEase</span>
            </h1>
          </div>

        </div>

        {/* SUBTITLE */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
          Rent your rooms smarter. Manage everything in one dashboard.
        </p>

        {/* CTA BUTTON */}
        <button
          onClick={() => navigate('/login')}
          className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-[#061A25] hover:bg-[#0a2535] text-white text-base sm:text-lg md:text-xl font-semibold rounded-lg shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50 border border-white/10"
        >
          GET STARTED
        </button>

        {/* FEATURES GRID */}
        <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl sm:text-4xl mb-3">📊</div>
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-2">Easy Management</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Organize your rent effortlessly
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="text-3xl sm:text-4xl mb-3">⚡</div>
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-2">Fast & Reliable</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Rent rooms in seconds
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all sm:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl mb-3">🔒</div>
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-2">Secure</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Your data is safe with us
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LandingPage;
