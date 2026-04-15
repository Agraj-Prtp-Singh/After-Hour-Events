import { useState } from "react";
import { Eye, EyeOff, LogOut, Pencil, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SETTINGS_STORAGE_KEY = "adminSettings";
const PASSWORD_STORAGE_KEY = "adminPassword";

function getInitialSettings() {
  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  const savedUser = localStorage.getItem("user");

  const user = savedUser ? JSON.parse(savedUser) : {};
  const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};

  return {
    fullName: parsedSettings.fullName || user.fullName || "Admin User",
    dob: parsedSettings.dob || "",
    email: parsedSettings.email || user.email || "",
  };
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getInitialSettings);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isSecurityEditing, setIsSecurityEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const savedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY) || "admin123";

  const handleProfileChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setProfileMessage("");
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const profileData = {
      fullName: settings.fullName.trim(),
      dob: settings.dob,
      email: settings.email.trim(),
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(profileData));

    const existingUser = localStorage.getItem("user");
    const parsedUser = existingUser ? JSON.parse(existingUser) : {};
    localStorage.setItem("user", JSON.stringify({ ...parsedUser, ...profileData }));

    setProfileMessage("Profile updated successfully.");
    setIsProfileEditing(false);
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordMessage("");
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();

    if (passwordForm.currentPassword !== savedPassword) {
      setPasswordMessage("Current password is incorrect.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    localStorage.setItem(PASSWORD_STORAGE_KEY, passwordForm.newPassword);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMessage("Password updated successfully.");
    setIsSecurityEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="w-full bg-[#F4F7FB] p-6 md:p-8">
      <section className="mb-6 rounded-[2rem] bg-[#0F172A] px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Manage Your Account
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
          Update your profile, manage password access, and securely logout from
          your admin dashboard.
        </p>
      </section>

      <div className="mx-auto max-w-5xl space-y-6">
        <form
          onSubmit={handleProfileSave}
          className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8"
        >
          <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Profile Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep your personal information up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsProfileEditing((current) => !current);
                setProfileMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={16} />
              {isProfileEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </span>
              <input
                type="text"
                value={settings.fullName}
                onChange={(event) =>
                  handleProfileChange("fullName", event.target.value)
                }
                className="input"
                disabled={!isProfileEditing}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Date of Birth
              </span>
              <input
                type="date"
                value={settings.dob}
                onChange={(event) => handleProfileChange("dob", event.target.value)}
                className="input"
                disabled={!isProfileEditing}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Email Address
              </span>
              <input
                type="email"
                value={settings.email}
                onChange={(event) =>
                  handleProfileChange("email", event.target.value)
                }
                className="input"
                disabled={!isProfileEditing}
                required
              />
            </label>
          </div>

          {profileMessage && (
            <p className="mt-4 text-sm font-medium text-emerald-600">
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!isProfileEditing}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4E7BFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3D69EA]"
          >
            <Save size={16} />
            Save Changes
          </button>
        </form>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
          <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Change your password and protect your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSecurityEditing((current) => !current);
                setPasswordMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={16} />
              {isSecurityEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Current Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                value={savedPassword}
                readOnly
                className="input pr-10"
              />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Enter Current Password
              </span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  handlePasswordFieldChange("currentPassword", event.target.value)
                }
                className="input"
                disabled={!isSecurityEditing}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                New Password
              </span>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    handlePasswordFieldChange("newPassword", event.target.value)
                  }
                  className="input pr-10"
                  disabled={!isSecurityEditing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Confirm New Password
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    handlePasswordFieldChange("confirmPassword", event.target.value)
                  }
                  className="input pr-10"
                  disabled={!isSecurityEditing}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            {passwordMessage && (
              <p
                className={`text-sm font-medium ${
                  passwordMessage.includes("success")
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!isSecurityEditing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4E7BFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3D69EA]"
            >
              <Save size={16} />
              Change Password
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="mb-3 text-sm text-slate-500">
              End your session on this device when you are done.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
