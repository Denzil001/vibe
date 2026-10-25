'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, 
  Camera, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Train, 
  KeyRound, 
  ShieldCheck, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import jsQR from 'jsqr';

export default function BoardingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Scan & Entry states
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detected & Validation states
  const [detectedData, setDetectedData] = useState<{
    displayNameHint: string;
    boardingCode: string;
    journey?: { id: string; code: string; name: string };
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) setCurrentUser(data.user);
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, []);

  // Camera stream management
  useEffect(() => {
    if (scanMode !== 'camera') {
      stopCamera();
      return;
    }

    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError('Camera access unavailable or denied. Please enter your code manually below.');
        setScanMode('manual');
      }
    }

    startCamera();

    return () => {
      stopCamera();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanMode]);

  function stopCamera() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function scanFrame() {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleDetectedQR(code.data);
      stopCamera();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }

  async function handleDetectedQR(rawText: string) {
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/board/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawQR: rawText }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setValidationError(data.error || 'Invalid or unrecognized food QR code.');
        setIsSubmitting(false);
        return;
      }

      // Parse code locally to pass to claim endpoint
      const tokens = rawText.trim().split(/\s+/);
      const code = tokens[tokens.length - 1].toUpperCase();

      setDetectedData({
        displayNameHint: data.displayNameHint,
        boardingCode: code,
        journey: data.journey,
      });

      // If user is already authenticated, claim immediately
      if (currentUser) {
        await executeClaim(code, data.displayNameHint, data.journey?.id);
      }
    } catch (err: any) {
      setValidationError('Failed to validate boarding pass with server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await handleDetectedQR(manualInput.trim());
  }

  async function executeClaim(code: string, displayNameHint: string, journeyId?: string) {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const res = await fetch('/api/board/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardingCode: code,
          displayNameHint,
          journeyId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || 'Failed to claim boarding pass.');
        setIsSubmitting(false);
        return;
      }

      setClaimSuccess(true);
      setTimeout(() => {
        router.push('/setup');
      }, 1500);
    } catch (err: any) {
      setValidationError('Error claiming boarding pass.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/20 mb-4 animate-bounce-subtle">
            <Train className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Board Your Train</h1>
          <p className="mt-2 text-sm text-slate-400">
            Scan the QR code printed on your train meal pack or voucher to check in to this journey.
          </p>
        </div>

        {/* Success State */}
        {claimSuccess ? (
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">Boarding Confirmed!</h2>
            <p className="text-sm text-emerald-300">
              Welcome aboard Coach B, <span className="font-semibold">{detectedData?.displayNameHint}</span>. Taking you to profile setup...
            </p>
            <div className="flex justify-center pt-2">
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setScanMode('camera')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  scanMode === 'camera'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
              <button
                type="button"
                onClick={() => setScanMode('manual')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  scanMode === 'manual'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Manual Code
              </button>
            </div>

            {/* Camera View */}
            {scanMode === 'camera' && (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-500/40 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanner reticle overlay */}
                  <div className="absolute inset-10 border-2 border-amber-400/80 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                    <div className="w-full h-0.5 bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  </div>

                  {!cameraActive && !cameraError && (
                    <div className="relative z-10 text-center p-4">
                      <Camera className="w-10 h-10 text-amber-400 mx-auto animate-pulse mb-2" />
                      <p className="text-xs text-slate-400">Requesting camera access...</p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="relative z-10 text-center p-4">
                      <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                      <p className="text-xs text-rose-300">{cameraError}</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-slate-400">
                  Align your food packaging QR code inside the frame.
                </p>
              </div>
            )}

            {/* Manual Entry Form */}
            {scanMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Food QR Content or Boarding Code
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="e.g. Aaromal S VT008M2 or VT008M2"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !manualInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Board</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Detected Confirmation if not logged in */}
            {detectedData && !currentUser && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valid Boarding Pass Detected</span>
                </div>
                <p className="text-xs text-slate-300">
                  Passenger confirmed: <span className="font-semibold text-white">{detectedData.displayNameHint}</span>
                  <br />
                  Journey: <span className="text-amber-300">{detectedData.journey?.name || 'Hackathon Express'}</span>
                </p>
                <div className="pt-2">
                  <Link
                    href={`/auth?name=${encodeURIComponent(detectedData.displayNameHint)}&code=${encodeURIComponent(detectedData.boardingCode)}&journeyId=${detectedData.journey?.id || ''}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Sign In or Create Account to Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Privacy info */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Your real name and food QR code are strictly private and never shown to other passengers.
              </span>
            </div>
          </div>
        )}

        {/* Footer help link */}
        <div className="text-center">
          <Link href="/help" className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need help with your QR code?</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
