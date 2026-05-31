import React, { useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { Shield, Camera, Wifi, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';


export const SetupScreen: React.FC = () => {
  const initializeSession = useAssessmentStore(state => state.initializeSession);
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [hardwareChecked, setHardwareChecked] = useState({
    webcam: false,
    network: false,
    fullscreen: false
  });
  const [checking, setChecking] = useState({
    webcam: false,
    network: false
  });

  const runHardwareCheck = (type: 'webcam' | 'network') => {
    setChecking(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setChecking(prev => ({ ...prev, [type]: false }));
      setHardwareChecked(prev => ({ ...prev, [type]: true }));
    }, 1500);
  };

  const handleStart = () => {
    if (!candidateName || !email || !agreed || !hardwareChecked.webcam || !hardwareChecked.network) return;
    initializeSession();
  };

  const allChecksPassed = hardwareChecked.webcam && hardwareChecked.network && agreed && candidateName && email;

  return (
    <div className="min-h-screen bg-enterprise-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-enterprise-dark to-enterprise-darker flex items-center justify-center p-6 text-gray-200 secure-select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-enterprise-card/60 backdrop-blur-xl border border-enterprise-border rounded-2xl shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-enterprise-border pb-6 mb-8">
          <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-xl">
            <Shield className="w-8 h-8 text-enterprise-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white m-0">
              SECURE ASSESSMENT PLATFORM
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-mono">
              Ecosystem ID: SECURE-PROCTOR-V2.8.4
            </p>
          </div>
          <div className="ml-auto bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400 font-semibold tracking-wider">SYSTEM SECURE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Input & Verification */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white tracking-wide">Candidate Authorization</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Candidate Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your registered name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full bg-enterprise-darker border border-enterprise-border focus:border-blue-500/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Registered Email Address</label>
                  <input 
                    type="email" 
                    placeholder="candidate@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-enterprise-darker border border-enterprise-border focus:border-blue-500/50 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Hardware Verification */}
            <div className="space-y-4 pt-2">
              <h2 className="text-lg font-semibold text-white tracking-wide">Secure Hardware Validation</h2>
              
              <div className="space-y-3">
                {/* Webcam Check */}
                <div className="flex items-center justify-between p-3.5 bg-enterprise-darker border border-enterprise-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Simulated Proctor Camera</p>
                      <p className="text-xs text-gray-400">Validate real-time video monitoring feed</p>
                    </div>
                  </div>
                  {hardwareChecked.webcam ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold font-mono">
                      <CheckCircle className="w-4 h-4" /> CALIBRATED
                    </span>
                  ) : (
                    <button 
                      onClick={() => runHardwareCheck('webcam')}
                      disabled={checking.webcam}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      {checking.webcam ? 'CALIBRATING...' : 'CALIBRATE FEED'}
                    </button>
                  )}
                </div>

                {/* Network Check */}
                <div className="flex items-center justify-between p-3.5 bg-enterprise-darker border border-enterprise-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Secure Data Node Integrity</p>
                      <p className="text-xs text-gray-400">Verifying secure WebSockets channel speed</p>
                    </div>
                  </div>
                  {hardwareChecked.network ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold font-mono">
                      <CheckCircle className="w-4 h-4" /> SYNCED (98ms)
                    </span>
                  ) : (
                    <button 
                      onClick={() => runHardwareCheck('network')}
                      disabled={checking.network}
                      className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      {checking.network ? 'SYNCING...' : 'SYNC CLIENT'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Security & Proctoring Regulations */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="bg-enterprise-darker/60 border border-enterprise-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-yellow-500 font-semibold text-sm">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>PROCTORING REGULATIONS</span>
              </div>
              
              <ul className="space-y-3.5 text-xs text-gray-400 font-mono">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Fullscreen Enforcement:</strong> The assessment operates in locked fullscreen mode. Exiting initiates immediate warning metrics.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Tab Switch Restriction:</strong> Swapping browser tabs or focusing on external software triggers automatic security alerts.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Input Shielding:</strong> Keyboard commands like copy-pasting, screenshot functions, and page inspect operations are hard blocked.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Strike Threshold:</strong> Accumulating 3 structural security violations causes immediate lockout and test submission.</span>
                </li>
              </ul>
            </div>

            {/* Terms checkbox */}
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4.5 h-4.5 mt-0.5 rounded border-enterprise-border bg-enterprise-darker text-blue-600 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-all"
                />
                <span className="text-xs text-gray-400 leading-normal">
                  I authorize this assessment workspace to activate live web proctoring, audit window events, and enforce locked fullscreen execution.
                </span>
              </label>

              <button
                onClick={handleStart}
                disabled={!allChecksPassed}
                className={`w-full py-3.5 rounded-xl font-semibold tracking-wider text-sm shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  allChecksPassed 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:shadow-glow' 
                  : 'bg-enterprise-border text-gray-500 cursor-not-allowed'
                }`}
              >
                <Monitor className="w-4.5 h-4.5" />
                INITIATE SECURE TERMINAL
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
