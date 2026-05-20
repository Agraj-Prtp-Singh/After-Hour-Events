import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Loader2,
  QrCode,
  Upload,
  XCircle,
} from "lucide-react";
import jsQR from "jsqr";
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
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const scannerTimerRef = useRef(null);
  const scanningRef = useRef(false);
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageScanning, setImageScanning] = useState(false);
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
    setCameraError("");
    setResult(null);

    try {
      const registration = await checkInAttendee(payload.trim());
      const attendee = registration.userId || {};
      const event = registration.eventId || {};

      setResult({
        type: "success",
        title: attendee.fullName || "Attendee checked in",
        message: `${event.title || "Event"} - ${formatCheckedInAt(registration.checkedInAt)}`,
        details: {
          eventTitle: event.title || "Event",
          email: attendee.email || "Not provided",
          phone: attendee.phone || "Not provided",
          ticketCode: registration.ticketCode || "Not issued",
          checkedInAt: formatCheckedInAt(registration.checkedInAt),
        },
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

  const createQrDetector = () => {
    if (!("BarcodeDetector" in window)) {
      return null;
    }

    return new window.BarcodeDetector({ formats: ["qr_code"] });
  };

  const createVideoScanCanvas = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    const maxDimension = 720;
    const scale = Math.min(
      1,
      maxDimension / Math.max(video.videoWidth, video.videoHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  };

  const handleManualCodeChange = (event) => {
    setManualCode(event.target.value);

    if (cameraError) {
      setCameraError("");
    }
  };

  const loadImageFromFile = (file) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      const imageUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Image could not be loaded."));
      };

      image.src = imageUrl;
    });

  const createScanCanvas = (image) => {
    const maxSize = 1800;
    const scale = Math.min(
      3,
      maxSize / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  };

  const detectQrWithBrowser = async (detector, source) => {
    if (!detector) return "";

    const codes = await detector.detect(source);
    return codes[0]?.rawValue || "";
  };

  const detectQrWithCanvas = (canvas) => {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    return code?.data || "";
  };

  const startCamera = async () => {
    setCameraError("");
    setResult(null);

    const detector = createQrDetector();
    const hasNativeDetector = Boolean(detector);

    try {
      const cameraOptions = [
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        { video: true, audio: false },
      ];
      let stream = null;

      for (const options of cameraOptions) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(options);
          break;
        } catch (error) {
          if (options === cameraOptions.at(-1)) {
            throw error;
          }
        }
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);

      if (!hasNativeDetector) {
        setCameraError(
          "Native barcode detection is unavailable. The camera will still try scanning using a fallback image scan.",
        );
      }

      scannerTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || scanningRef.current) return;

        try {
          let value = "";

          if (hasNativeDetector) {
            const codes = await detector.detect(videoRef.current);
            value = codes[0]?.rawValue || "";
          }

          if (!value) {
            const snapshot = createVideoScanCanvas();
            if (snapshot) {
              value = detectQrWithCanvas(snapshot);
            }
          }

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

  const scanUploadedImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setCameraError("");
    setResult(null);

    if (!file) return;

    try {
      setImageScanning(true);
      const detector = createQrDetector();
      const image = await loadImageFromFile(file);
      const canvas = createScanCanvas(image);

      const value =
        (await detectQrWithBrowser(detector, image)) ||
        (await detectQrWithBrowser(detector, canvas)) ||
        detectQrWithCanvas(canvas);
      if (!value) {
        setCameraError(
          "No QR code was found in that image. Try a clearer ticket screenshot.",
        );
        return;
      }

      submitScan(value);
    } catch (error) {
      setCameraError(
        "Could not read that image. Try another QR screenshot or paste the ticket code.",
      );
    } finally {
      setImageScanning(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scanner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Scan an attendee ticket to mark them checked in.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <section className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3">
                  <QrCode size={48} />
                  <span className="text-sm font-medium">
                    Camera scanner is idle
                  </span>
                </div>
              )}
              {(loading || imageScanning) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-semibold">
                    {imageScanning
                      ? "Reading QR image..."
                      : "Checking ticket..."}
                  </span>
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={scanUploadedImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || imageScanning}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition cursor-pointer"
              >
                {imageScanning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {imageScanning ? "Reading image" : "Browse QR image"}
              </button>
            </div>
          </section>

          <section className="bg-white border border-black/10 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Manual check-in
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Paste the QR payload or type the ticket code.
              </p>
            </div>

            <textarea
              value={manualCode}
              onChange={handleManualCodeChange}
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
                  {result?.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                  <div>
                    <p className="font-semibold">
                      {result?.title || "Camera scanner unavailable"}
                    </p>
                    <p className="mt-0.5">{result?.message || cameraError}</p>
                  </div>
                </div>

                {result?.type === "success" && result.details && (
                  <div className="mt-3 grid gap-2 border-t border-green-200 pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-green-800">
                        Event
                      </span>
                      <span className="text-right">
                        {result.details.eventTitle}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-green-800">
                        Email
                      </span>
                      <span className="text-right break-all">
                        {result.details.email}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-green-800">
                        Phone
                      </span>
                      <span className="text-right">{result.details.phone}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-green-800">
                        Ticket
                      </span>
                      <span className="font-mono text-right">
                        {result.details.ticketCode}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-green-800">
                        Checked in
                      </span>
                      <span className="text-right">
                        {result.details.checkedInAt}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
