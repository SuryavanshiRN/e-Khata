import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register(formData);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 flex">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="text-8xl mb-6 text-center"
          >
            🚀
          </motion.div>

          {/* Welcome Message */}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent text-center">
            Start Your Journey!
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 text-center leading-relaxed">
            Join thousands managing their finances smarter with AI-powered insights.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {[
              { icon: '✨', title: 'Smart Expense Tracking', desc: 'AI automatically categorizes your expenses' },
              { icon: '💡', title: 'Intelligent Insights', desc: 'Get personalized spending recommendations' },
              { icon: '📱', title: 'Easy to Use', desc: 'Beautiful interface, powerful features' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your financial data is encrypted and safe' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 glass-card backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 p-4 rounded-xl border border-white/30 shadow-glass"
              >
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative glass-card backdrop-blur-lg bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-glass-lg p-8 w-full max-w-md border border-white/20"
        >
          {/* Mobile Title */}
          <div className="lg:hidden text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl mb-4"
            >
              🚀
            </motion.div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Expense Manager
          </h1>
          <h2 className="text-lg font-medium text-center text-gray-600 dark:text-gray-300 mb-6">
            Create your account
          </h2>

          {error && (
            <div className="glass-card bg-gradient-danger-soft backdrop-blur-lg border border-red-300/30 dark:border-red-700/30 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4 shadow-glass">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Name
            </label>
              <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 glass rounded-lg backdrop-blur-sm bg-white/90 dark:bg-gray-700/90 border border-gray-200/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-glass transition-all duration-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 glass rounded-lg backdrop-blur-sm bg-white/90 dark:bg-gray-700/90 border border-gray-200/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-glass transition-all duration-200"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 glass rounded-lg backdrop-blur-sm bg-white/90 dark:bg-gray-700/90 border border-gray-200/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent shadow-glass transition-all duration-200"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-primary text-white py-3 rounded-lg hover:shadow-glow transition-all duration-200 font-semibold shadow-button hover:shadow-button-hover border border-white/20"
          >
            Register
          </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

