
import React, { useState, useRef } from 'react';
import { Mail, User as UserIcon, Camera, Sparkles, ChevronRight, ChevronLeft, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { User } from '../types';
import { INTEREST_OPTIONS } from '../constants';
import { generateBioFromInterests } from '../services/gemini';
import { db } from '../services/db';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  allUsers: User[];
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, allUsers }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('https://picsum.photos/seed/newuser/200');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Check database for user
      const user = await db.getUserByEmail(email);
      if (user) {
        onAuthSuccess(user);
      } else {
        // Fallback to mock users for demo compatibility
        const mockUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (mockUser) {
          onAuthSuccess(mockUser);
        } else {
          alert("No account found with this email. Try signing up!");
        }
      }
    } catch (err: any) {
      alert("Login error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicBio = async () => {
    if (interests.length === 0) return alert("Select some interests first!");
    setIsGenerating(true);
    const draft = await generateBioFromInterests(interests);
    setBio(draft);
    setIsGenerating(false);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        avatar,
        bio,
        interests
      };
      // Persist to database
      const savedUser = await db.saveUser(newUser);
      onAuthSuccess(savedUser);
    } catch (err: any) {
      alert("Sign up failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              <Users className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">SocialSync</h1>
            <p className="text-gray-500 text-sm mt-1">Find your tribe, attend together.</p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
              </button>
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="flex justify-between items-center mb-8 px-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-gray-400'
                    }`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        required
                        type="text"
                        placeholder="Alex Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        required
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!name || !email}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    Next Step <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map(interest => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            interests.includes(interest)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-gray-500 hover:bg-slate-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bio</label>
                      <button 
                        onClick={handleMagicBio}
                        disabled={isGenerating}
                        className="text-[10px] font-bold text-indigo-600 flex items-center hover:underline"
                      >
                        <Sparkles className="w-3 h-3 mr-1" /> {isGenerating ? 'AI Magic...' : 'AI Generate'}
                      </button>
                    </div>
                    <textarea 
                      placeholder="Tell us a bit about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm h-28"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 p-4 bg-slate-100 rounded-2xl text-gray-400 hover:bg-slate-200 transition-all">
                      <ChevronLeft className="w-5 h-5 mx-auto" />
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={interests.length === 0 || !bio}
                      className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl">
                      <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg text-indigo-600 hover:scale-110 transition-transform"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-lg">Looking good, {name.split(' ')[0]}!</h3>
                    <p className="text-sm text-gray-500">Upload a photo so people recognize you at events.</p>
                  </div>

                  <div className="w-full flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 p-4 bg-slate-100 rounded-2xl text-gray-400 hover:bg-slate-200 transition-all">
                      <ChevronLeft className="w-5 h-5 mx-auto" />
                    </button>
                    <button 
                      onClick={handleSignUp}
                      disabled={isSubmitting}
                      className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-extrabold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center pt-4">
                <button 
                  onClick={() => setMode('login')}
                  className="text-xs text-gray-400 font-semibold hover:text-indigo-600 underline"
                >
                  Already have an account? Log in
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-8 py-6 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Community Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
