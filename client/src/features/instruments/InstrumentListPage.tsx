import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { ApiResponse, InstrumentType, Role } from "@sih/shared";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { RegisterInstrumentDialog } from "./RegisterInstrumentDialog";
import {
  Scale,
  Plus,
  Search,
  FileCheck2,
  Filter,
  X,
  Calendar,
} from "lucide-react";

export function InstrumentListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["instruments", search, selectedType],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (selectedType) params.type = selectedType;
      const res = await api.get<ApiResponse<any[]>>("/instruments", { params });
      return res.data;
    },
  });

  const instruments = data?.data || [];

  // Derived stats
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const dueSoonCount = useMemo(() => {
    return instruments.filter((i) => {
      if (!i.nextDueAt) return false;
      const due = new Date(i.nextDueAt);
      return due <= thirtyDaysLater;
    }).length;
  }, [instruments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("instruments.title")}
            </h1>
            <Badge variant="outline" className="font-mono text-[10px] py-0.5">
              {t("instruments.registeredBadge", { count: instruments.length })}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("instruments.subtitle")}
          </p>
        </div>

        {(user?.role === Role.CONSUMER || user?.role === Role.ADMIN) && (
          <Button
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="h-8 text-xs font-bold bg-[#0B2545] hover:bg-[#133966] text-white shadow-xs rounded-lg transition-all"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t("instruments.registerButton")}
          </Button>
        )}
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("instruments.totalInstruments")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-[#0B2545] dark:text-slate-100 tracking-tight font-mono">
                {instruments.length}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{t("instruments.totalRegistered")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("instruments.complianceRate")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
                {instruments.length > 0
                  ? `${Math.round(((instruments.length - dueSoonCount) / instruments.length) * 100)}%`
                  : "100%"}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{t("instruments.activeStatus")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs bg-white dark:bg-card rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("instruments.dueForRenewal")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tracking-tight font-mono">
                {dueSoonCount}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">{t("instruments.actionRequired")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3.5 sm:p-4 bg-muted/20 border-border/80 rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            <Input
              placeholder={t("instruments.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-11 text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border text-foreground transition-all duration-300 ease-out focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 focus:border-[#0B2545] dark:focus:border-primary"
            />
            {search && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3.5 text-sm w-full sm:w-60 shadow-2xs outline-none transition-all duration-300 ease-out focus:outline-none focus:border-[#0B2545] dark:focus:border-primary focus:ring-4 focus:ring-[#0B2545]/15 dark:focus:ring-primary/20 font-medium text-slate-800 dark:text-foreground cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-card text-foreground">{t("instruments.allCategories")}</option>
              {Object.values(InstrumentType).map((tVal) => (
                <option key={tVal} value={tVal} className="bg-white dark:bg-card text-foreground">
                  {tVal.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Content State */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ) : isError ? (
        <div className="p-8 border border-destructive/40 bg-destructive/10 rounded-xl text-xs text-destructive text-center">
          {t("instruments.errorLoading")}
        </div>
      ) : instruments.length === 0 ? (
        <EmptyState
          icon={Scale}
          title={t("instruments.emptyTitle")}
          description={
            search || selectedType
              ? t("instruments.emptyFilterDesc")
              : t("instruments.emptyNoRecordsDesc")
          }
          action={
            <Button
              size="sm"
              onClick={() => {
                if (search || selectedType) {
                  setSearch("");
                  setSelectedType("");
                } else {
                  setIsRegisterOpen(true);
                }
              }}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {search || selectedType ? t("instruments.resetFilters") : t("instruments.registerFirst")}
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("instruments.table.serialNumber")}</TableHead>
                <TableHead>{t("instruments.table.makeModel")}</TableHead>
                <TableHead>{t("instruments.table.categoryType")}</TableHead>
                <TableHead>{t("instruments.table.capacity")}</TableHead>
                <TableHead>{t("instruments.table.accuracyClass")}</TableHead>
                {user?.role !== Role.CONSUMER && (
                  <TableHead>{t("instruments.table.owner")}</TableHead>
                )}
                <TableHead>{t("instruments.table.location")}</TableHead>
                <TableHead>{t("instruments.table.nextDue")}</TableHead>
                <TableHead className="text-right">{t("instruments.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.map((item) => {
                const isDueSoon =
                  item.nextDueAt && new Date(item.nextDueAt) <= thirtyDaysLater;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-bold text-foreground">
                      {item.serialNumber}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground block leading-tight">
                        {item.make}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.model}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {item.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {item.capacity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{item.accuracyClass}</span>
                    </TableCell>
                    {user?.role !== Role.CONSUMER && (
                      <TableCell className="text-xs font-medium text-foreground">
                        {item.owner?.name || "Registered Trader"}
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground">
                      {item.district}, {item.state}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isDueSoon
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }`}
                      >
                        {formatDate(item.nextDueAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/applications?instrumentId=${item.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-medium px-2.5 shadow-2xs"
                        >
                          <FileCheck2 className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                          {user?.role === Role.CONSUMER
                            ? t("instruments.table.apply")
                            : t("instruments.table.viewApplications")}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Registration Dialog */}
      <RegisterInstrumentDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </div>
  );
}
