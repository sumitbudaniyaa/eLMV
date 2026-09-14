import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse, AuditAction } from "@sih/shared";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { History, Shield, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export function AuditLogPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs", page, selectedAction],
    queryFn: async () => {
      const params: any = { page, limit: 25 };
      if (selectedAction) params.action = selectedAction;
      const res = await api.get<ApiResponse<any[]>>("/audit", { params });
      return res.data;
    },
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "SIGN_CERTIFICATE":
        return "certified";
      case "STATUS_CHANGE":
        return "scheduled";
      case "CREATE":
        return "submitted";
      case "LOGIN":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("audit.title")}
            </h1>
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              <Shield className="h-3 w-3 mr-1 text-muted-foreground" />
              {t("audit.badge")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("audit.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-input bg-card px-2.5 text-xs shadow-2xs"
          >
            <option value="">{t("audit.allActions")}</option>
            {Object.values(AuditAction).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            {t("audit.refresh")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-foreground">{t("audit.table.noLogs")}</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("audit.table.timestamp")}</TableHead>
                <TableHead>{t("audit.table.action")}</TableHead>
                <TableHead>{t("audit.table.entityType")}</TableHead>
                <TableHead>{t("audit.table.actor")}</TableHead>
                <TableHead>{t("common.role")}</TableHead>
                <TableHead>{t("audit.table.details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold text-foreground block">
                      {log.entity}
                    </span>
                    {log.entityId && (
                      <span className="font-mono text-[10px] text-muted-foreground block truncate max-w-[120px]">
                        {log.entityId}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground block">
                      {log.actor?.name || "Statutory System"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground font-mono">
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {log.actor?.role || "SYSTEM"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <pre className="text-[10px] font-mono bg-muted/40 p-2 rounded-md overflow-x-auto text-muted-foreground border border-border/40">
                      {log.changes ? JSON.stringify(log.changes) : "—"}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {meta && (meta.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/70 text-xs bg-muted/10">
              <span className="text-muted-foreground font-mono text-[11px]">
                Page {meta.page ?? 1} of {meta.totalPages ?? 1} ({meta.total ?? 0} total events recorded)
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 px-2.5 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (meta.totalPages ?? 1)}
                  onClick={() => setPage(page + 1)}
                  className="h-7 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
