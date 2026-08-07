import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Metric, Panel, Pill, Disclaimer } from "@/components/health/primitives";
import { TrendArea, TrendBars } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminGrowth,
  adminModuleUsage,
  adminSystemAlerts,
  adminUsers,
} from "@/lib/health-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — WellSync" },
      { name: "description", content: "Platform overview: user growth, module usage, system health and account management." },
      { property: "og:title", content: "Admin Dashboard — WellSync" },
      { property: "og:description", content: "Operational overview of the WellSync platform." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const active = adminUsers.filter((u) => u.status === "active").length;
  const totalRecords = adminUsers.reduce((a, u) => a + u.records, 0);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Administration
            </div>
            <h1 className="font-display truncate text-2xl font-bold uppercase tracking-[0.02em] sm:text-3xl">
              Platform Dashboard
            </h1>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link to="/app">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to app
            </Link>
          </Button>
        </header>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total users" accent="var(--mint)" value={adminGrowth[adminGrowth.length - 1]?.users.toLocaleString() ?? "0"} foot="All registered accounts" />
          <Metric label="Active this month" accent="var(--sky)" value={adminGrowth[adminGrowth.length - 1]?.active.toLocaleString() ?? "0"} foot="Logged at least once" />
          <Metric label="Health records" accent="var(--butter)" value={totalRecords.toLocaleString()} foot="Across sampled accounts" />
          <Metric label="Account status" accent="var(--salmon)" value={`${active}/${adminUsers.length}`} foot="Active vs total shown" />
        </div>

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Panel title="User growth" accent="var(--mint)">
            <TrendArea
              data={adminGrowth.map((g) => ({ ...g, date: g.month }))}
              series={[
                { key: "users", name: "Total users", color: "var(--mint)" },
                { key: "active", name: "Active users", color: "var(--sky)" },
              ]}
            />
          </Panel>
          <Panel title="Module usage" accent="var(--periwinkle)">
            <TrendBars
              xKey="module"
              data={adminModuleUsage}
              series={[{ key: "logs", name: "Logs", color: "var(--periwinkle)" }]}
            />
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Panel title="User accounts" accent="var(--sky)">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead>Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="whitespace-nowrap">{u.fullName}</TableCell>
                      <TableCell className="font-mono text-xs">{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <Pill color={u.status === "active" ? "var(--mint)" : "var(--salmon)"}>{u.status}</Pill>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{u.lastActive}</TableCell>
                      <TableCell>{u.records}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title="System health" accent="var(--butter)">
              <ul className="space-y-3">
                {adminSystemAlerts.map((a) => (
                  <li key={a.label} className="flex items-center justify-between gap-3 rounded-2xl bg-raised px-3 py-2.5">
                    <span className="min-w-0 truncate text-sm">{a.label}</span>
                    <Pill color={`var(--${a.tone})`}>{a.value}</Pill>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Compliance" accent="var(--salmon)">
              <Disclaimer />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
