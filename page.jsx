'use client';
import { useState } from 'react';
import { BookOpen, ArrowLeft, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [language, setLanguage] = useState('hindi');
  const [formData, setFormData] = useState({
    libraryName: '',
    ownerName: '',
    ownerPhone: '',
    password: '',
    confirmPassword: '',
    totalSeats: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const content = {
    hindi: {
      title: 'नई लाइब्रेरी रजिस्टर करें',
      subtitle: 'अपनी लाइब्रेरी की जानकारी भरें',
      fields: {
        libraryName: 'लाइब्रेरी का नाम',
        ownerName: 'मालिक का नाम',
        ownerPhone: 'मोबाइल नंबर',
        password: 'पासवर्ड',
        confirmPassword: 'पासवर्ड कन्फर्म करें',
        totalSeats: 'कुल सीटें'
      },
      placeholders: {
        libraryName: 'जैसे: सेंट्रल स्टडी लाइब्रेरी',
        ownerName: 'आपका पूरा नाम',
        ownerPhone: '+91XXXXXXXXXX',
        password: 'कम से कम 6 अक्षर',
        confirmPassword: 'पासवर्ड दोबारा लिखें',
        totalSeats: 'जैसे: 50'
      },
      buttons: {
        register: 'रजिस्टर करें',
        back: 'वापस जाएं'
      },
      messages: {
        success: 'लाइब्रेरी सफलतापूर्वक रजिस्टर हो गई! अब आप लॉगिन कर सकते हैं।',
        passwordMismatch: 'पासवर्ड मैच नहीं कर रहे',
        fillAllFields: 'कृपया सभी फील्ड भरें',
        phoneFormat: 'कृपया सही मोबाइल नंबर डालें'
      }
    },
    english: {
      title: 'Register New Library',
      subtitle: 'Fill in your library information',
      fields: {
        libraryName: 'Library Name',
        ownerName: 'Owner Name',
        ownerPhone: 'Mobile Number',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        totalSeats: 'Total Seats'
      },
      placeholders: {
        libraryName: 'e.g: Central Study Library',
        ownerName: 'Your full name',
        ownerPhone: '+91XXXXXXXXXX',
        password: 'At least 6 characters',
        confirmPassword: 'Re-enter password',
        totalSeats: 'e.g: 50'
      },
      buttons: {
        register: 'Register',
        back: 'Go Back'
      },
      messages: {
        success: 'Library registered successfully! You can now login.',
        passwordMismatch: 'Passwords do not match',
        fillAllFields: 'Please fill all fields',
        phoneFormat: 'Please enter a valid mobile number'
      }
    }
  };

  const currentContent = content[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.libraryName || !formData.ownerName || !formData.ownerPhone || 
        !formData.password || !formData.confirmPassword || !formData.totalSeats) {
      setError(currentContent.messages.fillAllFields);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(currentContent.messages.passwordMismatch);
      return;
    }

    if (!/^\+91\d{10}$/.test(formData.ownerPhone)) {
      setError(currentContent.messages.phoneFormat);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/libraries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.libraryName,
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          password: formData.password,
          totalSeats: parseInt(formData.totalSeats)
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const result = await response.json();
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'hindi' ? 'सफल!' : 'Success!'}
          </h2>
          <p className="text-gray-600 mb-6">{currentContent.messages.success}</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
                <ArrowLeft className="h-5 w-5" />
                <span>{currentContent.buttons.back}</span>
              </a>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hindi">हिंदी</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900">{currentContent.title}</h2>
              <p className="text-gray-600 mt-2">{currentContent.subtitle}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.libraryName}
                </label>
                <input
                  type="text"
                  value={formData.libraryName}
                  onChange={(e) => setFormData({...formData, libraryName: e.target.value})}
                  placeholder={currentContent.placeholders.libraryName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.ownerName}
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  placeholder={currentContent.placeholders.ownerName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.ownerPhone}
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                  placeholder={currentContent.placeholders.ownerPhone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.totalSeats}
                </label>
                <input
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                  placeholder={currentContent.placeholders.totalSeats}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.password}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={currentContent.placeholders.password}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentContent.fields.confirmPassword}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder={currentContent.placeholders.confirmPassword}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {language === 'hindi' ? 'रजिस्टर हो रहा है...' : 'Registering...'}
                  </div>
                ) : (
                  currentContent.buttons.register
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {language === 'hindi' ? 'पहले से अकाउंट है?' : 'Already have an account?'}{' '}
                <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  {language === 'hindi' ? 'लॉगिन करें' : 'Login'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}