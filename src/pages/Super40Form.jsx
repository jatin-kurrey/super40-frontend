import React, { useState, useEffect } from "react";
import { applicationService, examService, settingsService } from "../api";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, AlertCircle, KeyRound, Mail, Phone, User, GraduationCap } from "lucide-react";

const Super40RegisterForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    grade: "",
  });
  
  const [loginData, setLoginData] = useState({
    email: "",
    phone: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.get();
        setSettings(res.data || {});
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const emailNormalized = loginData.email.toLowerCase().trim();
    const phoneNormalized = loginData.phone.trim();

    localStorage.setItem('super40_student_email', emailNormalized);
    localStorage.setItem('super40_student_phone', phoneNormalized);
    
    // Check results date to determine where to redirect
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const releaseDate = settings.results_date ? new Date(settings.results_date) : null;
    
    if (releaseDate && today >= releaseDate) {
      navigate('/super40/results');
    } else {
      navigate('/super40/exams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const emailNormalized = formData.email.toLowerCase().trim();
      const phoneNormalized = formData.phone.trim();
      const nameNormalized = formData.name.trim();

      const payload = {
        form_type: "super_40",
        name: nameNormalized,
        email: emailNormalized,
        phone: phoneNormalized,
        data: {
          school: formData.school.trim(),
          grade: formData.grade
        }
      };
      
      await applicationService.submit(payload);
      
      localStorage.setItem('super40_student_email', emailNormalized);
      localStorage.setItem('super40_student_phone', phoneNormalized);
      localStorage.setItem('super40_student_name', nameNormalized);
      
      setSubmitted(true);
      
      // Fetch active exams and settings to determine redirection
      let redirectUrl = '/super40/exams';
      try {
        const [settingsRes, examsRes] = await Promise.all([
          settingsService.get(),
          examService.getActive()
        ]);
        
        const settingsData = settingsRes.data || {};
        const activeExams = Array.isArray(examsRes.data) ? examsRes.data : (examsRes.data?.data || []);
        const isDirectMode = settingsData.direct_exam_mode === 'true';
        
        if (isDirectMode && activeExams.length > 0) {
          // Redirect directly to the single active exam
          redirectUrl = `/super40/exam/${activeExams[0].id}`;
        }
      } catch (e) {
        console.error("Error determining exam redirection:", e);
      }
      
      // Navigate after a brief delay to show success
      setTimeout(() => {
        navigate(redirectUrl);
      }, 1500);
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enforce Registration Windows
  const getRegistrationState = () => {
    if (loadingSettings) return { state: "loading" };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startStr = settings.registration_start_date;
    const endStr = settings.registration_last_date;

    if (startStr) {
      const start = new Date(startStr);
      if (today < start) {
        return { state: "upcoming", date: startStr };
      }
    }

    if (endStr) {
      const end = new Date(endStr);
      if (today > end) {
        return { state: "closed", date: endStr };
      }
    }

    return { state: "open" };
  };

  const regStatus = getRegistrationState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-[40%] left-[20%] w-16 h-16 bg-blue-400/10 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-7xl w-full bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          {/* Left Side - Content */}
          <div 
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            
            <div className="text-center text-white relative z-10">
              {/* Animated Icon */}
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20">
                <div className="relative">
                  <svg className="w-16 h-16 animate-float" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <div className="absolute -inset-2 bg-white/10 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Super 40 Entrance Exam 2026
              </h1>

              {/* Subheading */}
              <p className="text-xl font-semibold text-cyan-100 mb-6">
                Secure Your Admission in Top College Programs
              </p>

              {/* Description */}
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                The 2026 Super 40 Entrance Exam is the gateway for meritorious students seeking admission into the college’s most prestigious programs. Perform well to be selected among the top candidates and gain early access to academic opportunities.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex items-center justify-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold">Merit-Based Selection</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold">Top Candidates Only</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold">Admission-Oriented Exam</span>
                </div>
              </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
          </div>

          {/* Right Side - Form, Login, or Locked Status Card */}
          <div className="p-8 lg:p-12 relative flex items-center justify-center w-full">
            {regStatus.state === "loading" ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Verifying Portal Status...</p>
              </div>
            ) : showLogin ? (
              /* High-Security Student Login Portal */
              <div className="w-full max-w-md space-y-8 animate-in fade-in">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <KeyRound className="w-9 h-9 text-blue-900" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase tracking-wide">Student Portal</h2>
                  <p className="text-slate-500 font-medium">Access your secure exams list and performance results.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="group">
                    <label className="block text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter registered email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="w-full p-4 pl-14 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white text-slate-950 font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter registered phone"
                        value={loginData.phone}
                        onChange={handleLoginChange}
                        className="w-full p-4 pl-14 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white text-slate-950 font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-900 hover:bg-blue-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    Enter Student Suite
                  </button>
                </form>

                {regStatus.state === "open" && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setShowLogin(false)}
                      className="text-xs text-blue-900 font-black uppercase tracking-wider hover:underline"
                    >
                      New Candidate? Register Here
                    </button>
                  </div>
                )}
              </div>
            ) : regStatus.state === "upcoming" ? (
              <div className="w-full text-center space-y-8 animate-in fade-in max-w-md">
                <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="w-10 h-10 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 uppercase tracking-wide">Registration Upcoming</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    The registration window for the Super 40 examination has not opened yet. It is scheduled to start on:
                  </p>
                  <p className="text-blue-900 font-black text-xl mt-4 bg-blue-50 px-6 py-3 rounded-2xl inline-block border border-blue-100">
                    {new Date(regStatus.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
                  Krishna Engineering College • Bhilai
                </div>
              </div>
            ) : regStatus.state === "closed" ? (
              <div className="w-full text-center space-y-8 animate-in fade-in max-w-md">
                <div className="w-24 h-24 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 uppercase tracking-wide">Registration Closed</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    The last date to register for the Super 40 examination has passed. The deadline was:
                  </p>
                  <p className="text-red-700 font-black text-xl mt-4 bg-red-50 px-6 py-3 rounded-2xl inline-block border border-red-100">
                    {new Date(regStatus.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full py-4 bg-slate-900 hover:bg-blue-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-all"
                  >
                    Already Registered? Student Login
                  </button>
                </div>

                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                  Krishna Engineering College • Bhilai
                </div>
              </div>
            ) : submitted ? (
              <div className="w-full text-center space-y-6 animate-in fade-in">
                <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/20">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Registration Complete</h2>
                <p className="text-slate-500 font-medium text-lg">
                  Verification successful. <br />
                  <span className="text-blue-900 font-bold">Redirecting to Evaluation Suite...</span>
                </p>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce"></div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 w-full"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-blue-900 mb-3">
                    Register for Super 40 2026
                  </h2>
                  <p className="text-blue-600 text-lg">Secure your chance to be among the top 40 students</p>
                </div>

                {/* Name Field */}
                <div className="group">
                  <label className="block text-blue-900 font-semibold mb-3 text-lg">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="group">
                  <label className="block text-blue-900 font-semibold mb-3 text-lg">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div className="group">
                  <label className="block text-blue-900 font-semibold mb-3 text-lg">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* School Field */}
                <div className="group">
                  <label className="block text-blue-900 font-semibold mb-3 text-lg">School Name</label>
                  <input
                    type="text"
                    name="school"
                    placeholder="Enter your school name"
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* Grade Field */}
                <div className="group">
                  <label className="block text-blue-900 font-semibold mb-3 text-lg">Grade / Standard</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-blue-50/80 border-2 border-blue-200 text-blue-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                    required
                  >
                    <option value="" disabled>Select your grade</option>
                    <option value="10th">10th Standard</option>
                    <option value="11th">11th Standard</option>
                    <option value="12th">12th Standard</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSubmitting ? "Registering..." : "Register for Super 40 2026"}
                    {!isSubmitting && (
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="text-xs text-blue-900 font-black uppercase tracking-wider hover:underline"
                  >
                    Already Registered? Student Login
                  </button>
                </div>

                <p className="text-center text-blue-600 text-sm mt-4">
                  By registering, you agree to our terms and conditions. Limited seats available.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      ` }} />
    </div>
  );
};

export default Super40RegisterForm;
