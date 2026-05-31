import React, { useEffect, useRef, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldCheck } from 'lucide-react';

export const WebcamProctor: React.FC = () => {
  const isHighRisk = useAssessmentStore(state => state.isHighRisk);
  const strikes = useAssessmentStore(state => state.strikes);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [gazeStatus, setGazeStatus] = useState('CENTERED');
  const [audioLevel, setAudioLevel] = useState(14); // dB

  // Attempt real camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        const constraints = { video: { width: 320, height: 240 }, audio: true };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraError(false);
      } catch (err) {
        console.warn("Real webcam permission denied. Loading fallback synthetic proctor mesh.", err);
        setCameraError(true);
      }
    };


    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate audio level variations
  useEffect(() => {
    const audioInterval = setInterval(() => {
      setAudioLevel(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, Math.min(28, prev + change));
      });
    }, 800);

    return () => clearInterval(audioInterval);
  }, []);

  // Simulate eye gaze fluctuations
  useEffect(() => {
    const gazeInterval = setInterval(() => {
      if (isHighRisk || strikes > 1) {
        setGazeStatus(Math.random() > 0.6 ? 'LEFT_OFFSET' : 'RIGHT_OFFSET');
      } else {
        setGazeStatus(Math.random() > 0.92 ? 'OFF_SCREEN' : 'CENTERED');
      }
    }, 2000);

    return () => clearInterval(gazeInterval);
  }, [isHighRisk, strikes]);

  // Fallback / HUD Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const renderHud = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw target corners (HUD bracket)
      ctx.strokeStyle = isHighRisk ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 2;
      const len = 15;
      
      // Top Left
      ctx.beginPath(); ctx.moveTo(10, 10 + len); ctx.lineTo(10, 10); ctx.lineTo(10 + len, 10); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(w - 10, 10 + len); ctx.lineTo(w - 10, 10); ctx.lineTo(w - 10 - len, 10); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(10, h - 10 - len); ctx.lineTo(10, h - 10); ctx.lineTo(10 + len, h - 10); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(w - 10, h - 10 - len); ctx.lineTo(w - 10, h - 10); ctx.lineTo(w - 10 - len, h - 10); ctx.stroke();

      // 2. Draw digital scanning grid line
      const scanY = (Math.sin(frameCount * 0.03) * 0.5 + 0.5) * h;
      ctx.strokeStyle = isHighRisk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, scanY);
      ctx.lineTo(w - 10, scanY);
      ctx.stroke();

      // 3. Fallback: Draw high-tech wireframe face mesh if camera is missing
      if (cameraError) {
        ctx.strokeStyle = isHighRisk ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1.5;
        const centerX = w / 2;
        const centerY = h / 2 + 5;
        
        // Head oval
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 45, 60, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Eye markers
        const eyeOffset = 16;
        ctx.fillStyle = isHighRisk ? '#ef4444' : '#3b82f6';
        ctx.beginPath(); ctx.arc(centerX - eyeOffset, centerY - 12, 3, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX + eyeOffset, centerY - 12, 3, 0, 2 * Math.PI); ctx.fill();

        // Dynamic eyebrow vectors
        ctx.beginPath();
        ctx.moveTo(centerX - eyeOffset - 8, centerY - 20);
        ctx.lineTo(centerX - eyeOffset + 8, centerY - 18 + (isHighRisk ? -3 : 0));
        ctx.moveTo(centerX + eyeOffset - 8, centerY - 18 + (isHighRisk ? -3 : 0));
        ctx.lineTo(centerX + eyeOffset + 8, centerY - 20);
        ctx.stroke();

        // Mesh nodes (jawline & facial structure connections)
        ctx.strokeStyle = isHighRisk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        // Crosshairs intersecting nose
        ctx.moveTo(centerX - 40, centerY); ctx.lineTo(centerX + 40, centerY);
        ctx.moveTo(centerX, centerY - 55); ctx.lineTo(centerX, centerY + 50);
        
        // Facial triangulations
        ctx.moveTo(centerX - eyeOffset, centerY - 12); ctx.lineTo(centerX, centerY + 10);
        ctx.moveTo(centerX + eyeOffset, centerY - 12); ctx.lineTo(centerX, centerY + 10);
        ctx.lineTo(centerX - 35, centerY + 20);
        ctx.lineTo(centerX - 45, centerY);
        ctx.lineTo(centerX - eyeOffset, centerY - 12);
        ctx.moveTo(centerX, centerY + 10); ctx.lineTo(centerX + 35, centerY + 20);
        ctx.lineTo(centerX + 45, centerY);
        ctx.lineTo(centerX + eyeOffset, centerY - 12);
        ctx.stroke();

        // Mouth arc
        ctx.beginPath();
        if (isHighRisk) {
          ctx.arc(centerX, centerY + 32, 10, Math.PI, 2 * Math.PI);
        } else {
          ctx.arc(centerX, centerY + 25, 12, 0, Math.PI);
        }
        ctx.stroke();
      } else {
        // Overlay target focus boxes around detected eye positions (Simulating eye tracking on real video feed)
        ctx.strokeStyle = isHighRisk ? '#ef4444' : '#10b981';
        ctx.lineWidth = 1.5;
        const boxSize = 14;
        const centerX = w / 2;
        const centerY = h / 2 - 5;
        
        // Simulating eye gaze box shifting
        let shiftX = 0;
        let shiftY = 0;
        if (gazeStatus === 'LEFT_OFFSET') shiftX = -20;
        if (gazeStatus === 'RIGHT_OFFSET') shiftX = 20;
        if (gazeStatus === 'OFF_SCREEN') { shiftX = -45; shiftY = -25; }

        ctx.strokeRect(centerX - 30 + shiftX, centerY + shiftY, boxSize, boxSize);
        ctx.strokeRect(centerX + 15 + shiftX, centerY + shiftY, boxSize, boxSize);
        
        // Bounding box around the estimated face center
        ctx.strokeStyle = isHighRisk ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
        ctx.strokeRect(centerX - 50 + shiftX / 2, centerY - 30 + shiftY / 2, 100, 110);
      }

      animId = requestAnimationFrame(renderHud);
    };

    renderHud();

    return () => cancelAnimationFrame(animId);
  }, [cameraError, isHighRisk, gazeStatus]);

  const isGazeFlagged = gazeStatus !== 'CENTERED';

  return (
    <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-4 flex flex-col items-center gap-3 relative select-none">
      {/* Recording indicator overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-enterprise-border">
        <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-red-500 animate-pulse' : 'bg-red-500 animate-ping'} `} />
        <span className="text-[8px] font-mono font-bold text-gray-300">REC</span>
      </div>

      <div className="absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-enterprise-border">
        <span className="text-[8px] font-mono font-semibold text-blue-400">FPS: 30.00</span>
      </div>

      {/* Main proctor feed viewport */}
      <div className="w-full aspect-[4/3] bg-black rounded-lg border border-enterprise-border overflow-hidden relative shadow-inner">
        {/* Real video if stream succeeded */}
        {!cameraError ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="absolute inset-0 bg-enterprise-darker flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]" />
          </div>
        )}

        {/* HUD overlay canvas */}
        <canvas 
          ref={canvasRef}
          width={280}
          height={210}
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        />

        {/* Threat overlay if risk triggered */}
        {isHighRisk && (
          <div className="absolute inset-0 border-2 border-red-500 animate-pulse-red pointer-events-none z-10" />
        )}
      </div>

      {/* Tech indicators */}
      <div className="w-full space-y-2 border-t border-enterprise-border/60 pt-2 font-mono text-[10px]">
        {/* Face Track Status */}
        <div className="flex justify-between items-center text-gray-400">
          <span>AI FEED AUDIT</span>
          {isHighRisk ? (
            <span className="text-red-500 font-bold animate-pulse">WARNING HIGH RISK</span>
          ) : (
            <span className="text-green-500 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> ACTIVE MONITORED
            </span>
          )}
        </div>

        {/* Eye Gaze status */}
        <div className="flex justify-between items-center text-gray-400">
          <span>GAZE ALIGNMENT</span>
          <span className={`font-semibold ${isGazeFlagged ? 'text-red-400 font-bold' : 'text-blue-400'}`}>
            {gazeStatus}
          </span>
        </div>

        {/* Simulated Audio levels */}
        <div className="flex justify-between items-center text-gray-400">
          <span>AUDIO LEVEL</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-enterprise-dark border border-enterprise-border rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${audioLevel > 22 ? 'bg-red-500 shadow-glow-red' : 'bg-blue-500'}`}
                style={{ width: `${(audioLevel / 35) * 100}%` }}
              />
            </div>
            <span className={audioLevel > 22 ? 'text-red-400 font-bold' : 'text-gray-300'}>
              {audioLevel} dB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
