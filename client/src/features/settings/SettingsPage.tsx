import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Lock,
  User,
  Phone,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  BadgeCheck,
  Pencil,
} from "lucide-react";
import { Role } from "@sih/shared";

export function SettingsPage() {
  const { i18n } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const isHindi = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase().startsWith("hi");

  // Notifications
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Profile Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Password Management State
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  const openEditDialog = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editName.trim() || editName.trim().length < 2) {
      setEditError(
        isHindi
          ? "कृपया कम से कम 2 अक्षरों का मान्य नाम दर्ज करें।"
          : "Please enter a valid full name (minimum 2 characters)."
      );
      return;
    }

    if (editPhone && !/^[6-9]\d{9}$/.test(editPhone.trim())) {
      setEditError(
        isHindi
          ? "कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setEditLoading(true);
    try {
      await api.patch("/users/credentials", {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: user?.email,
      });

      await refreshProfile();
      setEditDialogOpen(false);
      setProfileSuccess(
        isHindi
          ? "आपकी क्रेडेंशियल प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है।"
          : "Your account credentials have been updated successfully."
      );
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      setEditError(
        serverMsg ||
          (isHindi
            ? "क्रेडेंशियल अपडेट करने में विफल। कृपया पुनः प्रयास करें।"
            : "Failed to update credentials. Please try again.")
      );
    } finally {
      setEditLoading(false);
    }
  };

  const openPasswordDialog = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError(
        isHindi
          ? "कृपया अपना वर्तमान पासवर्ड दर्ज करें।"
          : "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        isHindi
          ? "नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।"
          : "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        isHindi
          ? "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते हैं।"
          : "New password and confirmation password do not match."
      );
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/users/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordDialogOpen(false);
      setPasswordSuccess(
        isHindi
          ? "आपका पासवर्ड सफलतापूर्वक बदल दिया गया है।"
          : "Your password has been changed successfully."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      setPasswordError(
        serverMsg ||
          (isHindi
            ? "पासवर्ड बदलने में विफल। कृपया अपना वर्तमान पासवर्ड जांचें।"
            : "Failed to change password. Please verify your current password.")
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleLabel = (role?: Role) => {
    switch (role) {
      case Role.CONSUMER:
        return isHindi ? "वाणिज्यिक व्यापारी / उपयोगकर्ता" : "Commercial Trader / User";
      case Role.LMO:
        return isHindi ? "विधिक मापविज्ञान अधिकारी (LMO)" : "Legal Metrology Officer (LMO)";
      case Role.GATC_ADMIN:
        return isHindi ? "जीएटीसी प्रयोगशाला व्यवस्थापक" : "GATC Laboratory Admin";
      case Role.GATC_INSPECTOR:
        return isHindi ? "जीएटीसी फील्ड निरीक्षक" : "GATC Field Inspector";
      case Role.ADMIN:
        return isHindi ? "राज्य नियंत्रक / मुख्य व्यवस्थापक" : "State Controller / Chief Admin";
      default:
        return isHindi ? "अधिकृत उपयोगकर्ता" : "Authorized User";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header — Cleaned up without statutory account badge */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2545] dark:text-slate-100 tracking-tight">
            {isHindi ? "खाता सेटिंग्स एवं क्रेडेंशियल्स" : "Account Settings & Credentials"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isHindi
              ? "अपनी व्यक्तिगत प्रोफ़ाइल, संपर्क जानकारी और पासवर्ड सुरक्षा प्रबंधित करें।"
              : "Manage your personal profile, verified contact information, and security credentials."}
          </p>
        </div>

        {/* Current Role Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-card px-3 py-1.5 rounded-xl border border-slate-200 dark:border-border shadow-2xs">
          <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 dark:text-muted-foreground block font-medium uppercase tracking-wider">
              {isHindi ? "प्रणाली भूमिका" : "System Role"}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-foreground">
              {getRoleLabel(user?.role as Role)}
            </span>
          </div>
        </div>
      </div>

      {/* Global Success Notifications */}
      {profileSuccess && (
        <div className="flex items-center space-x-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{profileSuccess}</span>
        </div>
      )}

      {passwordSuccess && (
        <div className="flex items-center space-x-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{passwordSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {/* CARD 1: PERSONAL CREDENTIALS & PROFILE (View Mode with Edit Dialog Trigger) */}
        <Card className="bg-white dark:bg-card border-slate-200/90 dark:border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/70 dark:bg-muted/40 border-b border-slate-100 dark:border-border p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-sm sm:text-base font-bold text-[#0B2545] dark:text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{isHindi ? "व्यक्तिगत क्रेडेंशियल विवरण" : "Personal Credentials & Profile"}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {isHindi
                    ? "आपका पंजीकृत नाम और संपर्क नंबर। ईमेल पता विधिक कारणों से अपरिवर्तनीय है।"
                    : "Your registered full name and phone number. Email address is non-changeable."}
                </CardDescription>
              </div>

              {/* Edit Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openEditDialog}
                className="h-9 px-3.5 text-xs font-bold border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto text-slate-800 dark:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5 text-[#0B2545] dark:text-blue-400" />
                <span>{isHindi ? "संपादित करें" : "Edit Details"}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <User className="h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground" />
                  <span>{isHindi ? "पूरा नाम" : "Full Name"}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-foreground tracking-tight">
                  {user?.name || "—"}
                </p>
              </div>

              {/* Contact Phone */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground" />
                  <span>{isHindi ? "संपर्क मोबाइल नंबर" : "Contact Mobile Number"}</span>
                </div>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-foreground tracking-tight">
                  {user?.phone ? `+91 ${user.phone}` : (isHindi ? "उपलब्ध नहीं" : "Not provided")}
                </p>
              </div>
            </div>

            {/* Registered Email ID — Non-changeable */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground" />
                  <span>{isHindi ? "पंजीकृत ईमेल आईडी" : "Registered Email ID"}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-muted/80 border border-slate-200 dark:border-border px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                  <Lock className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                  <span>{isHindi ? "अपरिवर्तनीय" : "Non-changeable"}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold font-mono text-slate-700 dark:text-slate-200 select-all">
                {user?.email || "—"}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isHindi
                    ? "पंजीकृत ईमेल आईडी पहचान सत्यापन हेतु अपरिवर्तनीय है।"
                    : "Registered Email ID serves as verified statutory identifier and cannot be modified."}
                </span>
              </p>
            </div>

            {/* Profile Associated Meta (if stakeholder or officer) */}
            {user?.stakeholderProfile && (
              <div className="p-4 bg-slate-50/60 dark:bg-muted/20 rounded-xl border border-slate-200 dark:border-border text-xs space-y-2 text-slate-600 dark:text-muted-foreground">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-foreground text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{user.stakeholderProfile.businessName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-slate-200/60 dark:border-border">
                  <span>GSTIN: <strong className="text-slate-800 dark:text-foreground font-mono">{user.stakeholderProfile.gstin || "Not provided"}</strong></span>
                  <span>Jurisdiction: <strong className="text-slate-800 dark:text-foreground">{user.stakeholderProfile.district}, {user.stakeholderProfile.state}</strong></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD 2: SECURITY & PASSWORD CHANGE (View Mode with Change Password Dialog Trigger) */}
        <Card className="bg-white dark:bg-card border-slate-200/90 dark:border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-sm sm:text-base font-bold text-[#0B2545] dark:text-foreground flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span>{isHindi ? "सुरक्षा एवं पासवर्ड प्रबंधन" : "Security & Password Management"}</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {isHindi
                    ? "अपने खाते की सुरक्षा बनाए रखने के लिए समय-समय पर अपना पासवर्ड बदलें।"
                    : "Change your password regularly to protect your account integrity."}
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPasswordDialog}
                className="h-9 px-3.5 text-xs font-bold border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto text-slate-800 dark:text-foreground"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#0B2545] dark:text-blue-400" />
                <span>{isHindi ? "पासवर्ड बदलें" : "Change Password"}</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* DIALOG 1: EDIT CREDENTIALS MODAL                                          */}
      {/* ========================================================================= */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            <span>{isHindi ? "क्रेडेंशियल्स संपादित करें" : "Edit Account Credentials"}</span>
          </DialogTitle>
          <DialogDescription>
            {isHindi
              ? "अपनी व्यक्तिगत जानकारी अपडेट करें। ईमेल पता विधिक कारणों से अपरिवर्तनीय है।"
              : "Update your full name and contact phone number. Email address is permanent."}
          </DialogDescription>
        </DialogHeader>

        {editError && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{editError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Registered Email (Disabled & Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
                <span>{isHindi ? "पंजीकृत ईमेल आईडी" : "Registered Email ID"}</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-muted border border-slate-200 dark:border-border px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                <span>{isHindi ? "अपरिवर्तनीय" : "Non-changeable"}</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                readOnly
                className="h-10 bg-slate-100 dark:bg-muted/80 text-slate-500 dark:text-muted-foreground font-mono text-xs cursor-not-allowed border-slate-200 dark:border-border select-none pr-10"
              />
              <div className="absolute right-3 text-slate-400 dark:text-muted-foreground pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
              <span>{isHindi ? "पूरा नाम" : "Full Name"}</span>
              <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={isHindi ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
              required
              className="h-10 bg-white dark:bg-background text-slate-900 dark:text-foreground text-xs font-medium border-slate-200 dark:border-border focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20"
            />
          </div>

          {/* Contact Mobile */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
              <span>{isHindi ? "संपर्क मोबाइल नंबर" : "Contact Mobile Number"}</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="h-10 px-3 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl flex items-center text-xs font-medium text-slate-600 dark:text-muted-foreground shrink-0">
                +91
              </div>
              <Input
                type="tel"
                maxLength={10}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder={isHindi ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                required
                className="h-10 bg-white dark:bg-background text-slate-900 dark:text-foreground text-xs font-mono border-slate-200 dark:border-border focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="h-10 text-xs font-semibold rounded-xl dark:border-border dark:hover:bg-muted dark:text-foreground"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={editLoading}
              className="h-10 px-5 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isHindi ? "सहेजा जा रहा है..." : "Saving..."}</span>
                </>
              ) : (
                <span>{isHindi ? "परिवर्तन सहेजें" : "Save Changes"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: CHANGE PASSWORD MODAL                                           */}
      {/* ========================================================================= */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <span>{isHindi ? "पासवर्ड बदलें" : "Change Password"}</span>
          </DialogTitle>
          <DialogDescription>
            {isHindi
              ? "खाता सुरक्षा सुनिश्चित करने के लिए मजबूत नया पासवर्ड चुनें।"
              : "Enter your current password and choose a strong new password."}
          </DialogDescription>
        </DialogHeader>

        {passwordError && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
              <span>{isHindi ? "वर्तमान पासवर्ड" : "Current Password"}</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Input
                type={showCurrentPass ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isHindi ? "अपना वर्तमान पासवर्ड दर्ज करें" : "Enter your current password"}
                required
                className="h-10 pr-10 bg-white dark:bg-background text-slate-900 dark:text-foreground text-xs border-slate-200 dark:border-border focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 text-slate-400 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground transition-colors p-1"
                title={showCurrentPass ? "Hide password" : "View password"}
                aria-label={showCurrentPass ? "Hide password" : "View password"}
              >
                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
              <span>{isHindi ? "नया पासवर्ड" : "New Password"}</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isHindi ? "नया पासवर्ड दर्ज करें (न्यूनतम 8 अक्षर)" : "Enter new password (min. 8 characters)"}
                required
                className="h-10 pr-10 bg-white dark:bg-background text-slate-900 dark:text-foreground text-xs border-slate-200 dark:border-border focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 text-slate-400 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground transition-colors p-1"
                title={showNewPass ? "Hide password" : "View password"}
                aria-label={showNewPass ? "Hide password" : "View password"}
              >
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isHindi
                ? "न्यूनतम 8 अक्षर आवश्यक हैं।"
                : "Must be at least 8 characters."}
            </p>
          </div>

          {/* Confirm New Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-500 dark:text-muted-foreground" />
              <span>{isHindi ? "नए पासवर्ड की पुष्टि करें" : "Confirm New Password"}</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isHindi ? "नया पासवर्ड पुनः दर्ज करें" : "Re-enter new password"}
                required
                className="h-10 pr-10 bg-white dark:bg-background text-slate-900 dark:text-foreground text-xs border-slate-200 dark:border-border focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 text-slate-400 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground transition-colors p-1"
                title={showConfirmPass ? "Hide password" : "View password"}
                aria-label={showConfirmPass ? "Hide password" : "View password"}
              >
                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              className="h-10 text-xs font-semibold rounded-xl dark:border-border dark:hover:bg-muted dark:text-foreground"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={passwordLoading}
              className="h-10 px-5 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{isHindi ? "पासवर्ड अपडेट हो रहा है..." : "Updating..."}</span>
                </>
              ) : (
                <span>{isHindi ? "पासवर्ड अपडेट करें" : "Update Password"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default SettingsPage;
