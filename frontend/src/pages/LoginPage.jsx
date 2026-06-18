import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cookie, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const { login, verifyOtp } = useAuth();
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugOtp, setDebugOtp] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.trim() === '') {
      setError('Please enter your mobile number.');
      return;
    }
    
    // Simple verification
    if (mobileNumber.length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await login(mobileNumber);
      // Retrieve the generated code in dev mode to show it on screen
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setError('Please enter a 4-digit code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyOtp(mobileNumber, otpCode);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Incorrect verification code. Try "1234".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-brand-pink/40 rounded-[36px] shadow-premium p-8 md:p-10 space-y-8 relative overflow-hidden">
        
        {/* Soft background shape */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-brand-pink/30 rounded-bl-full pointer-events-none"></div>

        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-brand-pink text-brand-chocolate rounded-2xl shadow-soft mr-3 mx-auto">
            <Cookie className="h-8 w-8 animate-spin-slow" />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-brand-chocolate pt-2">Welcome Back</h2>
          <p className="text-xs uppercase tracking-widest text-brand-chocolate-light font-bold">
            Cakes & Crunches AI Portal
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light block">
                Enter Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-brand-chocolate-light/40" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-brand-cream border border-brand-pink/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors placeholder:text-brand-chocolate-light/30"
                />
              </div>
              <p className="text-[10px] text-brand-chocolate-light/50">
                We'll verify your session using a quick 4-digit SMS OTP.
              </p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 text-center bg-red-50 border border-red-100 py-2 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream py-4 rounded-2xl font-bold shadow-premium transition-all duration-300 hover:translate-y-[-1px] disabled:opacity-55"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-brand-cream border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light block">
                  Enter 4-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-brand-rose hover:underline"
                >
                  Change number
                </button>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-brand-chocolate-light/40" />
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-brand-cream border border-brand-pink/50 rounded-2xl pl-12 pr-4 py-3.5 text-center text-lg font-bold tracking-[8px] focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors placeholder:text-brand-chocolate-light/20 placeholder:tracking-normal placeholder:font-normal"
                />
              </div>
              <p className="text-[10px] text-brand-chocolate-light/50 text-center mt-1">
                Sent to <span className="font-bold">{mobileNumber}</span>
              </p>
            </div>

            {/* OTP Banner Helper */}
            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 space-y-1 text-center animate-fade-in">
              <span className="text-xs font-bold text-amber-800 block">📱 Mock SMS Verification Mode</span>
              <p className="text-[10px] text-amber-700 leading-tight">
                {debugOtp ? (
                  <>Generated code for verification is <span className="font-extrabold text-sm text-brand-chocolate bg-white px-2 py-0.5 rounded border border-amber-200">{debugOtp}</span></>
                ) : (
                  "Checking server logs... Code printed to console. You can also use standard bypass code: 1234"
                )}
              </p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 text-center bg-red-50 border border-red-100 py-2 rounded-xl">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream py-4 rounded-2xl font-bold shadow-premium transition-all duration-300 hover:translate-y-[-1px] disabled:opacity-55"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-brand-cream border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Verify & Login</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
