"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Loader2, AlertCircle, LogOut } from "lucide-react";

export default function CheckOutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationError(""); },
        () => { setLocationError("Please enable location access to check out."); },
        { enableHighAccuracy: true }
      );
    } else { setLocationError("Geolocation is not supported."); }
  }, []);

  const handleSubmit = async () => {
    if (!location) { setError("Location is required."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/attendance/check-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ latitude: location.lat, longitude: location.lng }) });
      const data = await res.json();
      if (res.ok) router.push("/employee/dashboard?checkedOut=true");
      else setError(data.error || "Failed to check out");
    } catch (err: any) { setError(err.message || "An unexpected error occurred"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Check Out</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Log your departure time securely</p>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">{locationError || (location ? "Coordinates verified" : "Getting location...")}</p>
            </div>
          </div>
          {location && <CheckCircle className="h-6 w-6 text-emerald-500" />}
        </div>

        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
            <LogOut className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Ready to finish your shift?</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
            Your location will be checked against your office's geo-fenced boundaries.
          </p>
        </div>

        <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={handleSubmit}
            disabled={!location || loading}
            className="w-full flex justify-center items-center py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {loading ? (<><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>) : "Confirm Check Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
