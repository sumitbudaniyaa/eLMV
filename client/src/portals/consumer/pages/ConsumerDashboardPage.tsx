import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Cpu,
  FileCheck,
  Award,
  AlertTriangle,
  Plus,
  ArrowRight,
  Building,
  CalendarClock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RegisterInstrumentDialog } from "@/features/instruments/RegisterInstrumentDialog";
import { SubmitApplicationDialog } from "@/features/applications/SubmitApplicationDialog";
import { ApplicationStatus } from "@sih/shared";

export function ConsumerDashboardPage() {
  const { user } = useAuth();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["consumerDashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data.data;
    },
  });

  const stats = dashboardData?.stats;
  const expiringInstruments = dashboardData?.expiringInstruments || [];
  const recentApplications = dashboardData?.recentApplications || [];

  return (
    <div className="space-y-6">
      {/* Trader Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Commercial Establishment Workspace</h1>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Building className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{user?.stakeholderProfile?.businessName || "Commercial Business"}</span>
            <span>•</span>
            <span>GSTIN: {user?.stakeholderProfile?.gstin || "Registered"}</span>
            <span>•</span>
            <span>{user?.stakeholderProfile?.district || "Jaipur"}, {user?.stakeholderProfile?.state || "Rajasthan"}</span>
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRegisterOpen(true)}
            className="h-8 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Register Device
          </Button>
          <Button
            size="sm"
            onClick={() => setApplyOpen(true)}
            className="h-8 text-xs font-semibold"
          >
            <FileCheck className="h-3.5 w-3.5 mr-1" />
            Apply for Stamping
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Registered Devices</span>
              <Cpu className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {isLoading ? "..." : stats?.totalInstruments ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">In commercial operation</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Active Certificates</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600">
              {isLoading ? "..." : stats?.activeCertificates ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Stamped & verified</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Pending Verification</span>
              <FileCheck className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-sky-600">
              {isLoading ? "..." : stats?.pendingApplications ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">In inspection pipeline</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-900 dark:text-amber-300 font-semibold">Section 24 Renewal</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {isLoading ? "..." : stats?.expiringSoonCount ?? 0}
            </p>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">Due within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 24 Renewal Alert Card (if any expiring instruments) */}
      {expiringInstruments.length > 0 && (
        <Card className="border-amber-400 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Action Required: Commercial Devices Expiring Under Section 24
              </CardTitle>
            </div>
            <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 font-semibold">
              {expiringInstruments.length} instruments due
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mb-3">
              Using an unverified or expired weighing or measuring device in commercial trade is an offense under Section 24 of the Legal Metrology Act, 2009. Please schedule statutory re-verification immediately.
            </p>
            <div className="divide-y divide-amber-200 dark:divide-amber-900/60 border border-amber-200 dark:border-amber-900/60 rounded-md bg-background">
              {expiringInstruments.map((inst: any) => (
                <div key={inst.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-foreground">{inst.serialNumber}</span>
                    <span className="text-muted-foreground ml-2">({inst.make} • {inst.category})</span>
                    <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1 font-medium">
                      <CalendarClock className="h-3 w-3" />
                      Expires: {new Date(inst.nextDueAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setApplyOpen(true)}
                    className="h-7 text-xs border-amber-400 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950"
                  >
                    Renew Verification
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications Section */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-foreground">Recent Verification Filings</CardTitle>
          <Link
            to="/consumer/applications"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No recent applications found. Click "Apply for Stamping" to submit a new instrument verification request.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="p-3 font-medium">Application #</th>
                    <th className="p-3 font-medium">Instrument</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Submitted</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground">{app.applicationNumber}</td>
                      <td className="p-3">
                        <span className="font-mono text-foreground">{app.instrument?.serialNumber}</span>
                        <span className="text-[11px] text-muted-foreground ml-1.5">({app.instrument?.make})</span>
                      </td>
                      <td className="p-3">{app.type === "NEW" ? "New Verification" : "Re-Verification"}</td>
                      <td className="p-3">
                        <Badge variant={app.status === ApplicationStatus.CERTIFIED ? "default" : "outline"} className="text-[10px]">
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(app.submittedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <Link
                          to="/consumer/applications"
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <RegisterInstrumentDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      <SubmitApplicationDialog open={applyOpen} onOpenChange={setApplyOpen} />
    </div>
  );
}
