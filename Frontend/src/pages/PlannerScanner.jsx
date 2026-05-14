import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import { checkInAttendee } from "../api/planner";

const formatCheckedInAt = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

export default function PlannerScanner() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerTimerRef = useRef(null);
  const scanningRef = useRef(false);
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState(null);

  const stopCamera = () => {
    if (scannerTimerRef.current) {
      clearInterval(scannerTimerRef.current);
      scannerTimerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => stopCamera, []);

  const submitScan = async (payload) => {
    if (!payload.trim() || loading || scanningRef.current) return;

    scanningRef.current = true;
    setLoading(true);
    setResult(null);

    try {
      const registration = await checkInAttendee(payload.trim());
      const attendee = registration.userId || {};
      const event = registration.eventId || {};

      setResult({
        type: "success",
        title: attendee.fullName || "Attendee checked in",
        message: `${event.title || "Event"} - ${formatCheckedInAt(registration.checkedInAt)}`,
      });
      setManualCode("");
      stopCamera();
    } catch (err) {
      setResult({
        type: "error",
        title: "Check-in failed",
        message: err.message || "Could not check in this ticket.",
      });
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        scanningRef.current = false;
      }, 1200);
    }
  };

  const startCamera = async () => {
    setCameraError("");
    setResult(null);

    if (!("BarcodeDetector" in window)) {
      setCameraError("Camera QR scanning is not supported in this browser. Paste the QR text or ticket code below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scannerTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || scanningRef.current) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes[0]?.rawValue;
          if (value) {
            submitScan(value);
          }
        } catch (error) {
          setCameraError("Could not read from the camera. Try manual entry.");
          stopCamera();
        }
      }, 700);
    } catch (error) {
      setCameraError("Camera permission is needed to scan QR tickets.");
      stopCamera();
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scanner</h1>
          <p className="text-sm text-gray-500 mt-1">Scan an attendee ticket to mark them checked in.</p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <section className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3">
                  <QrCode size={48} />
                  <span className="text-sm font-medium">Camera scanner is idle</span>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-semibold">Checking ticket...</span>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCamera}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                <Camera size={16} />
                {cameraActive ? "Stop camera" : "Start camera"}
              </button>
            </div>
          </section>

          <section className="bg-white border border-black/10 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manual check-in</h2>
              <p className="text-sm text-gray-500 mt-1">Paste the QR payload or type the ticket code.</p>
            </div>

            <textarea
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="AHE-XXXX or QR payload"
              className="min-h-32 w-full resize-none rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="button"
              onClick={() => submitScan(manualCode)}
              disabled={loading || !manualCode.trim()}
              className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Check in attendee
            </button>

            {(cameraError || result) && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  result?.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result?.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <div>
                    <p className="font-semibold">{result?.title || "Scanner unavailable"}</p>
                    <p className="mt-0.5">{result?.message || cameraError}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
