"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function CheckInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationError(""); },
        (err) => { setLocationError("Please enable location access to check in."); },
        { enableHighAccuracy: true }
      );
    } else { setLocationError("Geolocation is not supported."); }
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch { setError("Please allow camera access."); }
  };

  const stopCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current, c = canvasRef.current;
      c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((b) => { if (b) { setPhotoBlob(b); setPhotoUrl(URL.createObjectURL(b)); stopCamera(); } }, "image/jpeg", 0.8);
    }
  };

  const retakePhoto = () => { setPhotoBlob(null); setPhotoUrl(null); startCamera(); };

  const handleSubmit = async () => {
    if (!location) { setError("Location is required."); return; }
    if (!photoBlob) { setError("Photo proof is required."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData(); fd.append("file", photoBlob, "checkin.jpg");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("Failed to upload photo");
      const uploadData = await uploadRes.json();
      const checkinRes = await fetch("/api/attendance/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ latitude: location.lat, longitude: location.lng, photoUrl: uploadData.url }) });
      const data = await checkinRes.json();
      if (checkinRes.ok) router.push("/employee/dashboard?checkedIn=true");
      else setError(data.error || "Failed to check in");
    } catch (err: any) { setError(err.message || "An unexpected error occurred"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Check In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record your attendance securely</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Error</h3>
            <p className="text-sm text-red-500 dark:text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${location ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <MapPin className={`h-5 w-5 ${location ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Location Status</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{locationError || (location ? "Obtained successfully" : "Getting location...")}</p>
            </div>
          </div>
          {location && <CheckCircle className="h-6 w-6 text-emerald-500" />}
        </div>

        <div className="p-5 sm:p-6">
          <p className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-500" /> Photo Verification
          </p>
          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl aspect-video relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
            {photoUrl ? (
              <img src={photoUrl} alt="Captured" className="w-full h-full object-cover" />
            ) : stream ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
            ) : (
              <div className="text-center p-6">
                <Camera className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
                <button onClick={startCamera} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 transition-colors rounded-xl text-sm border border-slate-300 dark:border-slate-700">Enable Camera</button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {stream && !photoUrl && (
            <div className="mt-4 flex justify-center">
              <button onClick={takePhoto} className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 border-4 border-emerald-200 dark:border-emerald-900/50 shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
          )}

          {photoUrl && (
            <div className="mt-4 flex justify-center">
              <button onClick={retakePhoto} className="text-sm font-medium text-emerald-500 hover:text-emerald-600">Retake Photo</button>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={handleSubmit}
            disabled={!location || !photoBlob || loading}
            className="w-full flex justify-center items-center py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
          >
            {loading ? (<><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>) : "Submit Check In"}
          </button>
        </div>
      </div>
    </div>
  );
}
