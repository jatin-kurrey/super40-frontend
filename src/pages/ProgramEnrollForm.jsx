import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationService, settingsService } from "../api";
import {
  Calendar, Clock, AlertCircle, Mail, Phone, User,
  GraduationCap, BookOpen, CheckCircle, Drone, Car, Code2,
  ArrowLeft, Shield, Zap, ChevronRight
} from "lucide-react";

const PROGRAM_META = {
  drone: {
    title: "Drone Technology",
    tagline: "Master Aerial Intelligence & Flight Programming",
    icon: Drone,
    accentColor: "#00BA59",
    gradient: "from-green-600 to-emerald-800",
    formType: "PROGRAM_DRONE",
    settingsPrefix: "drone",
    duration: "4 Weeks",
    price: "₹12,999",
  },
  ev: {
    title: "EV Manufacturing & Embedded Systems",
    tagline: "Power the Future of Electric Mobility",
    icon: Car,
    accentColor: "#1D78FD",
    gradient: "from-blue-600 to-indigo-800",
    formType: "PROGRAM_EV",
    settingsPrefix: "ev",
    duration: "4 Weeks",
    price: "₹14,999",
  },
  coding: {
    title: "Advanced Coding Program",
    tagline: "Build the Software That Runs the World",
    icon: Code2,
    accentColor: "#FF6463",
    gradient: "from-red-600 to-rose-800",
    formType: "PROGRAM_CODING",
    settingsPrefix: "coding",
    duration: "4 Weeks",
    price: "₹11,999",
  },
};

const DEPARTMENTS = [
  "Computer Science Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Civil Engineering",
  "Information Technology",
  "Other",
];

const ProgramEnrollForm = () => {
  const { programSlug } = useParams();
  const navigate = useNavigate();

  const program = PROGRAM_META[programSlug];

  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    semester: "",
    college: "",
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

  // Registration gate logic using admin-controlled settings
  const getRegistrationStatus = () => {
    if (loadingSettings) return { state: "loading" };
    if (!program) return { state: "invalid" };

    const prefix = program.settingsPrefix;
    const startKey = `${prefix}_enrollment_start`;
    const endKey = `${prefix}_enrollment_end`;

    // If no dates set, allow registration
    if (!settings[startKey] && !settings[endKey]) {
      return { state: "open" };
    }

    const now = new Date();

    if (settings[startKey]) {
      const startDate = new Date(settings[startKey]);
      if (now < startDate) {
        return { state: "upcoming", start: settings[startKey] };
      }
    }

    if (settings[endKey]) {
      const endDate = new Date(settings[endKey]);
      // Set end of day
      endDate.setHours(23, 59, 59, 999);
      if (now > endDate) {
        return { state: "closed", end: settings[endKey] };
      }
    }

    return { state: "open" };
  };

  const regStatus = getRegistrationStatus();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        form_type: program.formType,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        data: {
          department: formData.department,
          semester: formData.semester,
          college: formData.college.trim(),
          program: program.title,
        },
      };

      await applicationService.submit(payload);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission Error:", err);
      const msg = err?.response?.data?.error || "Something went wrong. Please try again.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───── Invalid Program ─────
  if (!program) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Program Not Found</h2>
          <p className="text-slate-500 font-medium">The program you're looking for doesn't exist.</p>
          <a href="/" className="inline-block px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const Icon = program.icon;

  // ───── Loading ─────
  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${program.accentColor}50`, borderTopColor: program.accentColor }}
          />
          <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
            Loading Enrollment Portal...
          </p>
        </div>
      </div>
    );
  }

  // ───── Registration Not Yet Open ─────
  if (regStatus.state === "upcoming") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
            style={{ backgroundColor: `${program.accentColor}10`, border: `1px solid ${program.accentColor}30` }}
          >
            <Calendar className="w-8 h-8" style={{ color: program.accentColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
              Enrollment Not Yet Open
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Enrollment for <strong>{program.title}</strong> will open on:
            </p>
            <p className="font-black text-lg mt-4 px-6 py-3 rounded-xl inline-block"
              style={{ backgroundColor: `${program.accentColor}10`, color: program.accentColor, border: `1px solid ${program.accentColor}30` }}
            >
              {new Date(regStatus.start).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
            Krishna Engineering College • Bhilai
          </div>
        </div>
      </div>
    );
  }

  // ───── Registration Closed ─────
  if (regStatus.state === "closed") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
              Enrollment Closed
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              The enrollment window for <strong>{program.title}</strong> has closed.
              Please check back for the next batch.
            </p>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
            Krishna Engineering College • Bhilai
          </div>
        </div>
      </div>
    );
  }

  // ───── Success State ─────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.02)] text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
            style={{ backgroundColor: `${program.accentColor}10`, border: `1px solid ${program.accentColor}30` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: program.accentColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
              Enrollment Submitted!
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Thank you, <strong>{formData.name}</strong>! Your enrollment for{" "}
              <strong>{program.title}</strong> has been received. We'll contact you
              at <strong>{formData.email}</strong> with further details.
            </p>
          </div>
          <div className="p-4 rounded-2xl text-sm font-medium space-y-2"
            style={{ backgroundColor: `${program.accentColor}08`, border: `1px solid ${program.accentColor}20` }}
          >
            <div className="flex items-center gap-2" style={{ color: program.accentColor }}>
              <Clock className="w-4 h-4" />
              <span className="font-black text-xs uppercase tracking-widest">Next Steps</span>
            </div>
            <p className="text-slate-600 text-xs">
              Our team will verify your registration and send confirmation details within 24–48 hours.
            </p>
          </div>
          <a href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105"
            style={{ backgroundColor: program.accentColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to KEC Website
          </a>
        </div>
      </div>
    );
  }

  // ───── Main Enrollment Form ─────
  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Top Hero Strip */}
      <div className={`bg-gradient-to-br ${program.gradient} py-16 px-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)`, backgroundSize: '28px 28px' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/20">
            <Icon className="w-5 h-5 text-white" />
            <span className="text-white font-black text-xs uppercase tracking-widest">Enrollment Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
            {program.title}
          </h1>
          <p className="text-white/70 text-lg font-medium">{program.tagline}</p>

          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: Clock, label: program.duration },
              { icon: BookOpen, label: program.price },
              { icon: GraduationCap, label: "Certificate Included" },
            ].map(({ icon: Ic, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/80 text-sm font-bold">
                <Ic className="w-4 h-4 opacity-70" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ backgroundColor: program.accentColor }}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Enrollment Form
            </h2>
            <p className="text-slate-500 font-medium">
              Fill in your details to secure your seat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Full Name *
              </label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Email Address *
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Phone Number *
              </label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* College */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                College / Institution *
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  name="college"
                  required
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Your college or institution name"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Department & Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Department *
                </label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-5 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 appearance-none"
                >
                  <option value="">Select Dept.</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Semester *
                </label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-5 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 appearance-none"
                >
                  <option value="">Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={`${s}`}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 rounded-2xl font-black text-white text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
              style={{
                backgroundColor: program.accentColor,
                boxShadow: `0 8px 32px ${program.accentColor}40`,
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Enrollment...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Submit Enrollment
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Your information is secure and will not be shared</span>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
          Krishna Engineering College • Bhilai • ISAB Programs
        </div>
      </div>
    </div>
  );
};

export default ProgramEnrollForm;
