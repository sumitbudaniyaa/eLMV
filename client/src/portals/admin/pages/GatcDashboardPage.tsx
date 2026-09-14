import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function GatcDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [delegateModalOpen, setDelegateModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInspectorId, setSelectedInspectorId] = useState("");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["gatcAgencyDashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data.data;
    },
  });

  const { data: inspectors = [] } = useQuery({
    queryKey: ["gatcInspectorsList"],
    queryFn: async () => {
      const res = await api.get("/gatc/inspectors");
      return res.data.data;
    },
  });

  const delegateMutation = useMutation({
    mutationFn: async ({ appId, inspectorId }: { appId: string; inspectorId: string }) => {
      const res = await api.post(`/gatc/applications/${appId}/delegate`, { inspectorId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatcAgencyDashboard"] });
      setDelegateModalOpen(false);
      setSelectedAppId(null);
      setSelectedInspectorId("");
    },
  });

  const agencyProfile = dashboardData?.agencyProfile || user?.gatcProfile;
  const stats = dashboardData?.stats;
  const upcomingSchedule = dashboardData?.upcomingSchedule || [];

  return (
    <div className="space-y-6">
      {/* Agency Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">
              {agencyProfile?.agencyName || "Apex Precision Metrology & Calibration Labs"}
            </h1>
            <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 border-primary/20 text-primary">
              NABL ACCREDITED
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="font-mono font-medium text-foreground">NABL #{agencyProfile?.accreditationNumber || "NABL-LM-RJ-2024-041"}</span>
            <span>•</span>
            <span>Valid Until: {agencyProfile?.validUntil ? new Date(agencyProfile.validUntil).toLocaleDateString() : "2028-12-31"}</span>
            <span>•</span>
            <span>{agencyProfile?.district || "Jaipur"}, {agencyProfile?.state || "Rajasthan"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inspectors">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
              <Users className="h-3.5 w-3.5 mr-1" />
              Manage Staff ({stats?.inspectorsCount || inspectors.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Testing Engineers</span>
              <Users className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {isLoading ? "..." : stats?.inspectorsCount ?? inspectors.length}
            </p>
            <p className="text-[11px] text-muted-foreground">In-house field staff</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Active Testing Queue</span>
              <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
              {isLoading ? "..." : stats?.pendingInspections ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Calibration jobs in progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Completed Calibrations</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {isLoading ? "..." : stats?.completedInspections ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Observations recorded</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Certified Instruments</span>
              <Award className="h-4 w-4 text-primary dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-primary dark:text-blue-400">
              {isLoading ? "..." : stats?.certifiedCount ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Under agency testing scopes</p>
          </CardContent>
        </Card>
      </div>

      {/* Authorized Testing Scopes Card */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-bold text-foreground">Authorized Laboratory Testing Scopes (Rule 14)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {(agencyProfile?.authorizedScope || ["NON_AUTOMATIC_WEIGHING_INSTRUMENT", "FUEL_DISPENSER"]).map((scope: string) => (
              <div
                key={scope}
                className="px-3 py-1.5 rounded-md border border-border bg-muted/30 flex items-center gap-2 text-xs font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>{scope.replace(/_/g, " ")}</span>
                <span className="text-[10px] text-muted-foreground font-mono">(Class II & III)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Testing Pipeline Table */}
      <Card className="shadow-2xs">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-foreground">Assigned Testing Jobs & Bench Pipeline</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Testing batches assigned to this Agency awaiting inspection or engineer delegation.
            </p>
          </div>
          <Link
            to="/applications"
            className="text-xs text-primary dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingSchedule.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No active testing batches currently scheduled.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="p-3 font-medium">Application #</th>
                    <th className="p-3 font-medium">Instrument Details</th>
                    <th className="p-3 font-medium">Applicant Establishment</th>
                    <th className="p-3 font-medium">Assigned Engineer</th>
                    <th className="p-3 font-medium">Scheduled Date</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcomingSchedule.map((app: any) => (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground">{app.applicationNumber}</td>
                      <td className="p-3">
                        <span className="font-mono text-foreground font-semibold">{app.instrument?.serialNumber}</span>
                        <span className="text-[11px] text-muted-foreground ml-1.5">({app.instrument?.make})</span>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground font-medium">{app.applicant?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{app.instrument?.district}</p>
                      </td>
                      <td className="p-3">
                        {app.assignedOfficer?.name ? (
                          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <UserCheck className="h-3 w-3" />
                            <span>{app.assignedOfficer.name}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        {app.scheduledDate ? new Date(app.scheduledDate).toLocaleDateString() : "Pending"}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setDelegateModalOpen(true);
                          }}
                          className="h-7 text-xs"
                        >
                          Delegate Job
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delegate Testing Job Modal */}
      <Dialog open={delegateModalOpen} onOpenChange={setDelegateModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Delegate Testing to Engineer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Select an authorized in-house field testing engineer from your agency staff roster:
            </p>
            <div>
              <label className="text-xs font-semibold text-foreground">Select Inspector *</label>
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-white dark:bg-card text-foreground px-2.5 py-1 text-xs"
              >
                <option value="" className="bg-white dark:bg-card text-foreground">-- Choose Field Inspector --</option>
                {inspectors.map((insp: any) => (
                  <option key={insp.user?.id} value={insp.user?.id} className="bg-white dark:bg-card text-foreground">
                    {insp.user?.name} ({insp.employeeId} • {insp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDelegateModalOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedInspectorId || delegateMutation.isPending}
                onClick={() => {
                  if (selectedAppId && selectedInspectorId) {
                    delegateMutation.mutate({ appId: selectedAppId, inspectorId: selectedInspectorId });
                  }
                }}
                className="text-xs h-8 font-semibold"
              >
                {delegateMutation.isPending ? "Assigning..." : "Confirm Delegation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
