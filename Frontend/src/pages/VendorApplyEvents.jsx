import { useEffect, useMemo, useState } from "react";
import { applyToVendorEvent, getVendorEvents } from "../api/vendor";

const defaultFormState = {
  eventId: "",
  stallName: "",
  offerings: "",
  notes: "",
  paymentScreenshot: "",
};

const readImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function VendorApplyEvents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    getVendorEvents()
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || "Could not load available events.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!event?.openToVendors) return false;
        const eventEndDate = new Date(event.endDate);
        return !Number.isNaN(eventEndDate.getTime()) && eventEndDate >= new Date();
      }),
    [events],
  );

  const selectedEvent = useMemo(
    () => activeEvents.find((event) => String(event._id) === String(formData.eventId)),
    [activeEvents, formData.eventId],
  );

  const openApplicationModal = (eventId) => {
    setFormData({
      ...defaultFormState,
      eventId,
    });
    setSubmitMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(defaultFormState);
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitMessage("Payment screenshot must be an image file.");
      return;
    }

    if (file.size > 2_500_000) {
      setSubmitMessage("Payment screenshot must be smaller than 2.5MB.");
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      handleInputChange("paymentScreenshot", dataUrl);
      setSubmitMessage("");
    } catch (err) {
      setSubmitMessage("Could not read payment screenshot.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitMessage("");

      await applyToVendorEvent(formData.eventId, {
        stallName: formData.stallName.trim(),
        offerings: formData.offerings.trim(),
        notes: formData.notes.trim(),
        paymentScreenshot: formData.paymentScreenshot,
      });

      setSubmitMessage("Event application submitted. Waiting for planner approval.");
      closeModal();
    } catch (err) {
      setSubmitMessage(err.message || "Failed to submit application.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F4F7FB] p-6 md:p-8">
      <section className="mb-6 rounded-[2rem] bg-[#0F172A] px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          Apply for Events
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Available Event Applications
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
          Browse event planner events and submit your stall proposal.
        </p>
      </section>

      {submitMessage && (
        <div className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700">
          {submitMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading available events...</p>
        ) : activeEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No active events available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeEvents.map((event) => (
              <article
                key={event._id}
                className="rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">Event Date:</span>{" "}
                    {formatDate(event.startDate)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">Location:</span>{" "}
                    {event.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openApplicationModal(event._id)}
                  className="mt-4 rounded-xl bg-[#4E7BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D69EA]"
                >
                  Apply
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Vendor Stall Application
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Share your stall idea for this event.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Select Event
                </span>
                <select
                  value={formData.eventId}
                  onChange={(event) => handleInputChange("eventId", event.target.value)}
                  className="input"
                  required
                >
                  <option value="">Choose an event</option>
                  {activeEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              {selectedEvent && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Security Deposit
                      </p>
                      <p className="mt-1 text-2xl font-bold text-blue-700">
                        Rs. {Number(selectedEvent.vendorSecurityDeposit || 0).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Scan the planner&apos;s QR, pay the deposit, then upload your payment screenshot below.
                      </p>
                    </div>

                    {selectedEvent.vendorPaymentQrImage ? (
                      <img
                        src={selectedEvent.vendorPaymentQrImage}
                        alt="Planner payment QR"
                        className="h-40 w-40 rounded-xl border border-slate-200 bg-white object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-400">
                        No QR uploaded by planner
                      </div>
                    )}
                  </div>
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Stall Name
                </span>
                <input
                  type="text"
                  value={formData.stallName}
                  onChange={(event) => handleInputChange("stallName", event.target.value)}
                  className="input"
                  placeholder="e.g. Himalayan Organic Bites"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  What will your stall provide?
                </span>
                <textarea
                  value={formData.offerings}
                  onChange={(event) => handleInputChange("offerings", event.target.value)}
                  className="input min-h-24"
                  placeholder="Food menu, products, services, experience..."
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Additional Notes
                </span>
                <textarea
                  value={formData.notes}
                  onChange={(event) => handleInputChange("notes", event.target.value)}
                  className="input min-h-20"
                  placeholder="Power needs, setup details, team size, etc."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Screenshot
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="input"
                  required={Number(selectedEvent?.vendorSecurityDeposit || 0) > 0}
                />
                {formData.paymentScreenshot && (
                  <img
                    src={formData.paymentScreenshot}
                    alt="Payment screenshot preview"
                    className="mt-3 h-40 w-full rounded-xl border border-slate-200 object-contain p-2"
                  />
                )}
              </label>
            </div>

            {submitMessage && (
              <p className="mt-4 text-sm font-medium text-red-500">{submitMessage}</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#4E7BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D69EA] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
