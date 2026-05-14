import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  getVendorApplications,
  reviewVendorApplication,
} from "../api/planner";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function PlannerVendorApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");

  const loadApplications = () => {
    setIsLoading(true);
    getVendorApplications()
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Could not load vendor applications.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleReview = async (applicationId, decision) => {
    try {
      setReviewingId(applicationId);
      setError("");
      const updated = await reviewVendorApplication(applicationId, decision);
      setApplications((current) =>
        current.map((item) => (item._id === applicationId ? updated : item)),
      );
    } catch (err) {
      setError(err.message || "Could not review application.");
    } finally {
      setReviewingId("");
    }
  };

  return (
    <div className="w-full bg-[#F4F7FB] p-6 md:p-8">
      <section className="mb-6 rounded-[2rem] bg-[#0F172A] px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          Vendor Apps
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Vendor Applications
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
          Review vendor stall requests for your events.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading vendor applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-slate-500">No vendor applications yet.</p>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => {
              const status = application.status || "pending";
              const isPending = status === "pending";
              const isReviewing = reviewingId === application._id;

              return (
                <article
                  key={application._id}
                  className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.stallName}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[status] || statusStyles.pending
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {application.eventId?.title || "Untitled Event"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.vendorId?.fullName || "Vendor"} ·{" "}
                        {application.vendorId?.email || "No email"} · Applied{" "}
                        {formatDate(application.createdAt)}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview(application._id, "approved")}
                          disabled={isReviewing}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(application._id, "rejected")}
                          disabled={isReviewing}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-800">Offerings:</span>{" "}
                      {application.offerings}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Notes:</span>{" "}
                      {application.notes || "-"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-800">Security Deposit:</span>{" "}
                      Rs. {Number(application.eventId?.vendorSecurityDeposit || 0).toLocaleString()}
                    </p>
                    <div>
                      <span className="font-semibold text-slate-800">
                        Payment Screenshot:
                      </span>
                      {application.paymentScreenshot ? (
                        <a
                          href={application.paymentScreenshot}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block w-fit"
                        >
                          <img
                            src={application.paymentScreenshot}
                            alt="Vendor payment screenshot"
                            className="h-36 w-52 rounded-xl border border-slate-200 object-contain p-2"
                          />
                        </a>
                      ) : (
                        <p className="mt-1">Not uploaded</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
