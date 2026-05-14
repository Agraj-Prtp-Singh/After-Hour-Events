import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Loader2, CheckCircle } from "lucide-react";
import { createEvent, getPlannerEvents, updateEvent } from "../api/planner";

const EMPTY_FORM = {
  title: "",
  startDate: "",
  endDate: "",
  location: "",
  category: "",
  description: "",
  ticketPrice: "",
  capacity: "",
  vendorSecurityDeposit: "",
  vendorPaymentQrImage: "",
};

const readImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [openToVendors, setOpenToVendors] = useState(true);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [paymentQrPreview, setPaymentQrPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(Boolean(editId));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!editId) {
      return;
    }

    getPlannerEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const event = list.find((item) => String(item._id || item.id) === String(editId));

        if (!event) {
          throw new Error("Event not found for editing.");
        }

        setForm({
          title: event.title || "",
          startDate: formatDateTimeLocal(event.startDate),
          endDate: formatDateTimeLocal(event.endDate),
          location: event.location || "",
          category: event.category || "",
          description: event.description || "",
          ticketPrice: String(event.ticketPrice ?? ""),
          capacity: String(event.capacity ?? ""),
          vendorSecurityDeposit: String(event.vendorSecurityDeposit ?? ""),
          vendorPaymentQrImage: event.vendorPaymentQrImage || "",
        });
        setPaymentQrPreview(event.vendorPaymentQrImage || "");
        setOpenToVendors(event.openToVendors ?? true);
      })
      .catch((err) => {
        setError(err.message || "Failed to load event details.");
      })
      .finally(() => setLoadingEvent(false));
  }, [editId]);

  const handleChange = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleBanner = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handlePaymentQr = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Payment QR must be an image file.");
      return;
    }

    if (file.size > 2_500_000) {
      setError("Payment QR image must be smaller than 2.5MB.");
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setPaymentQrPreview(dataUrl);
      setForm((current) => ({ ...current, vendorPaymentQrImage: dataUrl }));
      setError("");
    } catch (err) {
      setError("Could not read the Payment QR image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.startDate || !form.location) {
      setError("Please fill in all required fields (title, start date, location).");
      return;
    }

    if (form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    if (
      openToVendors &&
      Number(form.vendorSecurityDeposit || 0) > 0 &&
      !form.vendorPaymentQrImage
    ) {
      setError("Please upload a Payment QR for the vendor security deposit.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        location: form.location,
        category: form.category || undefined,
        description: form.description || undefined,
        ticketPrice: form.ticketPrice ? Number(form.ticketPrice) : 0,
        capacity: form.capacity ? Number(form.capacity) : 0,
        openToVendors,
        vendorSecurityDeposit:
          openToVendors && form.vendorSecurityDeposit
            ? Number(form.vendorSecurityDeposit)
            : 0,
        vendorPaymentQrImage: openToVendors ? form.vendorPaymentQrImage : "",
      };

      if (bannerFile) {
        payload.bannerFileName = bannerFile.name;
      }

      if (editId) {
        await updateEvent(editId, payload);
      } else {
        await createEvent(payload);
      }

      setSuccess(true);
      setTimeout(() => navigate("/planner/dashboard"), 1200);
    } catch (err) {
      setError(err.message || "Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <CheckCircle size={56} className="text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900">
          {editId ? "Event Updated!" : "Event Created!"}
        </h2>
        <p className="text-gray-500 text-sm">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {editId ? "Edit Event" : "Create New Event"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loadingEvent ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-slate-400 shadow-sm">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading event data...</span>
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Event title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                placeholder="Enter event title"
                value={form.title}
                onChange={handleChange("title")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 shadow-sm resize-none"
                placeholder="Describe your event..."
                value={form.description}
                onChange={handleChange("description")}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Event banner image
              </label>
              <label className="cursor-pointer block">
                <div
                  className={`w-full bg-white border-2 border-dashed border-black/10 rounded-xl flex items-center justify-center overflow-hidden transition hover:border-blue-400 ${
                    bannerPreview ? "h-44" : "h-28"
                  }`}
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400 py-6">
                      <CalendarDays size={28} className="mx-auto mb-1 text-gray-300" />
                      <p className="text-xs">Click to upload banner image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBanner}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                  value={form.startDate}
                  onChange={handleChange("startDate")}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                  value={form.endDate}
                  onChange={handleChange("endDate")}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Location / Venue <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                placeholder="Enter venue or address"
                value={form.location}
                onChange={handleChange("location")}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Category
                </label>
                <select
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                  value={form.category}
                  onChange={handleChange("category")}
                >
                  <option value="">Select category</option>
                  <option value="Tech">Tech</option>
                  <option value="Social">Social</option>
                  <option value="Career">Career</option>
                  <option value="Arts">Arts</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                  placeholder="e.g. 150"
                  value={form.capacity}
                  onChange={handleChange("capacity")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Ticket Price
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                  placeholder="0.00"
                  value={form.ticketPrice}
                  onChange={handleChange("ticketPrice")}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Open to vendors?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenToVendors(true)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      openToVendors
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-500 border-black/10"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenToVendors(false)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      !openToVendors
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-500 border-black/10"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {openToVendors && (
              <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment QR
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Vendors will see this QR only after admin approval and must upload a payment screenshot when applying.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Security Deposit
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm"
                      placeholder="e.g. 1000"
                      value={form.vendorSecurityDeposit}
                      onChange={handleChange("vendorSecurityDeposit")}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      QR Image
                    </label>
                    <label className="cursor-pointer block">
                      <div className="flex min-h-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/10 bg-white transition hover:border-blue-400">
                        {paymentQrPreview ? (
                          <img
                            src={paymentQrPreview}
                            alt="Payment QR preview"
                            className="h-40 w-full object-contain p-2"
                          />
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-400">
                            <p className="text-xs">Click to upload vendor payment QR</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePaymentQr}
                      />
                    </label>
                  </div>
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-12">
              <button
                type="button"
                onClick={() => navigate("/planner/dashboard")}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-black/10 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Event"
                  : "Create Event"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
