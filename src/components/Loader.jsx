import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Building2, Sparkles } from "lucide-react";

const icons = [
  { id: 1, Icon: BookOpen, text: "Knowledge" },
  { id: 2, Icon: GraduationCap, text: "Excellence" },
  { id: 3, Icon: Building2, text: "Evaluation" },
];

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[999]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-100"
            initial={{ 
              scale: 0,
              opacity: 0,
              x: Math.random() * 100 - 50 + "vw",
              y: Math.random() * 100 - 50 + "vh"
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut"
            }}
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white rounded-3xl">
        {/* Icon animation */}
        <motion.div
          className="flex gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {icons.map(({ id, Icon, text }, i) => (
            <motion.div
              key={id}
              className="flex flex-col items-center"
              initial={{ y: 50, opacity: 0, rotate: -10 }}
              animate={{ 
                y: [50, -15, 0], 
                opacity: 1,
                rotate: 0
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <div className="relative p-4 bg-blue-50 rounded-2xl shadow-sm mb-3 border border-blue-100">
                <Icon size={42} className="text-blue-700" />
                
                {/* Sparkle effect */}
                <motion.div
                  className="absolute -top-2 -right-2 text-yellow-500"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles size={16} fill="currentColor" />
                </motion.div>
              </div>
              
              <motion.span 
                className="text-blue-800 text-sm font-medium mt-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.2 }}
              >
                {text}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        {/* Name */}
        <motion.div className="text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0, 1, 0.9, 1], 
              y: 0 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Super 40 Portal
          </motion.h1>
          
          <motion.p
            className="text-blue-700 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Where Excellence Meets Opportunity
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <motion.div 
          className="w-64 h-2 bg-blue-100 rounded-full mt-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div 
        className="mt-6 text-blue-700 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.span>
      </motion.div>
    </div>
  );
};

export default Loader;
