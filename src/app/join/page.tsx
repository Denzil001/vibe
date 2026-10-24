'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Train, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  KeyRound,
  UserCheck
} from 'lucide-react';
import jsQR from 'jsqr';

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(urlToken);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Camera Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Authentication & Username State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Registration Form State (if not logged in)
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; error?: string; suggestions?: string[] }>({ checking: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState<any>(null);

  // Check auth on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .finally(() => setIsAuthChecking(false));
  }, []);

  // If token is provided in URL, validate it automatically
  useEffect(() => {
    if (urlToken) {
      validateToken(urlToken);
    }
  }, [urlToken]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError('');
    setIsScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser. Please enter the QR token manually below.');
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        scanQRCode();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. You can manually enter the QR token or join link code below.');
      } else {
        setCameraError('Could not start camera. Please verify device camera permissions or enter the code manually.');
      }
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // Successfully detected QR!
        stopCamera();
        let extractedToken = code.data.trim();
        if (extractedToken.includes('token=')) {
          try {
            const url = new URL(extractedToken);
            extractedToken = url.searchParams.get('token') || extractedToken;
          } catch (e) {
            // keep raw token
          }
        }
        setTokenInput(extractedToken);
        validateToken(extractedToken);
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const validateToken = async (tokenString: string) => {
    if (!tokenString.trim()) return;
    setIsValidating(true);
    setValidationError('');
    setTokenInfo(null);

    try {
      const res = await fetch('/api/qr/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenString.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setValidationError(data.error || 'Invalid, revoked, or expired QR pass.');
      } else {
        setTokenInfo(data);
      }
    } catch (err) {
      setValidationError('Failed to validate QR pass. Please check your connection.');
    } finally {
      setIsValidating(false);
    }
  };

  // Username live check with debouncing
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: data.available,
          error: data.error,
          suggestions: data.suggestions,
        });
      } catch (e) {
        setUsernameStatus({ checking: false, error: 'Could not verify username.' });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload: any = {
        token: tokenInput.trim(),
      };

      if (!currentUser) {
        if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
          setSubmitError('All onboarding fields are required.');
          setIsSubmitting(false);
          return;
        }
        payload.signupData = {
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        };
      }

      const res = await fetch('/api/qr/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Failed to complete QR onboarding.');
      } else {
        setJoinSuccess(data);
        setTimeout(() => {
          router.push(data.redirectUrl || '/dashboard');
        }, 1800);
      }
    } catch (err) {
      setSubmitError('Server error while processing join pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] bg-dark-grid-pattern text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-4">
            <QrCode className="w-4 h-4" />
            VIBE PASS // ONBOARDING GATEWAY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Scan & Board Your Journey
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Scan a coach QR sticker or enter a train pass token to unlock your journey cohort and connect with fellow travellers.
          </p>
        </div>

        {/* Success Modal / State */}
        {joinSuccess ? (
          <div className="bento-dark-card p-8 text-center border-emerald-500/50 bg-emerald-950/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
            <p className="text-emerald-400 font-mono text-sm mb-4">{joinSuccess.message}</p>
            <p className="text-slate-400 text-xs mb-6">
              Your account begins with a clean base reputation score of 100 points. Redirecting you to your cohort...
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              Launching train dashboard...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stage 1: QR Scanner & Token Input */}
            <div className="bento-dark-card p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 1: Validate QR Pass</h2>
                    <p className="text-xs text-slate-400">Scan camera QR code or enter token string</p>
                  </div>
                </div>
                {tokenInfo && (
                  <span className="sys-tag bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>

              {/* Camera Scanner Section */}
              <div className="mb-6">
                {isScanning ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none m-6 flex items-center justify-center">
                      <span className="text-[11px] font-mono text-emerald-400 bg-black/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Align train QR code in frame
                      </span>
                    </div>
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg"
                    >
                      <CameraOff className="w-3.5 h-3.5" /> Stop Scanner
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-4 px-4 rounded-xl border border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-850 flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Scan with Device Camera</p>
                      <p className="text-xs text-slate-400">Point at coach wall sticker or digital invite pass</p>
                    </div>
                  </button>
                )}

                {cameraError && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Manual Token Entry Fallback */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Or Enter Pass Token Manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="e.g. vibe_jrn_12951_rajdhani or vbt_..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => validateToken(tokenInput)}
                    disabled={isValidating || !tokenInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-navy-950 font-bold text-xs uppercase tracking-wider font-mono transition-colors flex items-center gap-1.5"
                  >
                    {isValidating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Validate'
                    )}
                  </button>
                </div>

                {/* Pre-configured Demo Passes for Hackathon Testing */}
                <div className="pt-2">
                  <p className="text-[11px] font-mono text-slate-500 mb-1.5">Try sample demo train passes:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTokenInput('vibe_jrn_12951_rajdhani');
                        validateToken('vibe_jrn_12951_rajdhani');
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                    >
                      Mumbai Rajdhani (12951)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTokenInput('vibe_grp_tech_startups');
                        validateToken('vibe_grp_tech_startups');
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                    >
                      Tech Cohort Group Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTokenInput('vibe_onboard_public_welcome');
                        validateToken('vibe_onboard_public_welcome');
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                    >
                      General Community Pass
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {tokenInfo && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 mt-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                      <Sparkles className="w-4 h-4" />
                      Target Cohort Identified:
                    </div>
                    <p className="text-sm font-bold text-white">{tokenInfo.qrToken?.label}</p>
                    {tokenInfo.targetJourney && (
                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                        <Train className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Train {tokenInfo.targetJourney.trainNumber} • {tokenInfo.targetJourney.trainName}</span>
                      </div>
                    )}
                    {tokenInfo.targetGroup && (
                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Community: {tokenInfo.targetGroup.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2: Account & Username Creation / Confirmation */}
            {tokenInfo && (
              <form onSubmit={handleJoinSubmit} className="bento-dark-card p-6 sm:p-8 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Step 2: Passenger Identity</h2>
                      <p className="text-xs text-slate-400">Confirm your unique journey handle</p>
                    </div>
                  </div>
                </div>

                {currentUser ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-400">You are currently logged in as:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.displayName}
                          className="w-10 h-10 rounded-full border border-emerald-400"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{currentUser.displayName}</p>
                          <p className="text-xs font-mono text-emerald-400">@{currentUser.username}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        Score: {currentUser.reputationScore ?? 100}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Joining with this account will link your journey cohort while preserving your score history and existing chats.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Full Name or Nickname
                        </label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={e => {
                            setDisplayName(e.target.value);
                            if (!username) {
                              const base = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                              if (base.length >= 3) {
                                setUsername(`${base}_${Math.floor(10 + Math.random() * 90)}`);
                              }
                            }
                          }}
                          placeholder="e.g. Maya Iyer"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Unique Username
                          </label>
                          {usernameStatus.checking ? (
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                            </span>
                          ) : usernameStatus.available ? (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Available
                            </span>
                          ) : usernameStatus.error ? (
                            <span className="text-[10px] font-mono text-rose-400 truncate max-w-[130px]">
                              {usernameStatus.error}
                            </span>
                          ) : null}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm">@</span>
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="maya_iyer"
                            maxLength={20}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                        {usernameStatus.suggestions && usernameStatus.suggestions.length > 0 && !usernameStatus.available && (
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500">Suggestions:</span>
                            {usernameStatus.suggestions.map((sug, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setUsername(sug)}
                                className="text-[10px] font-mono text-emerald-400 hover:underline"
                              >
                                @{sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="maya@example.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                          Password (min 8 chars)
                        </label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>
                        VIBE starts every passenger with an untampered <strong>100 community points</strong> baseline. You can edit your username later at any time without resetting your reputation score or interaction history.
                      </span>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                  <Link
                    href="/"
                    className="text-xs font-mono uppercase text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting || (!currentUser && (!usernameStatus.available || !displayName || !email || password.length < 8))}
                    className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-navy-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Boarding...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Boarding</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center font-mono text-xs text-emerald-400">
        LOADING VIBE PASS GATEWAY...
      </div>
    }>
      <JoinPageContent />
    </React.Suspense>
  );
}
