import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  Bell,
  Brain,
  CalendarCheck,
  ChevronRight,
  Gauge,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Plug,
  Settings,
  Sparkles,
  Target,
  User as UserIcon,
  Waypoints,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHealthStore } from "@/lib/health-store";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Activity; exact?: boolean };

const NAV: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/activity", label: "Activity", icon: Activity },
  { to: "/app/nutrition", label: "Nutrition", icon: Apple },
  { to: "/app/mind", label: "Mental Well-being", icon: Brain },
  { to: "/app/sleep", label: "Sleep", icon: Moon },
  { to: "/app/habits", label: "Habits", icon: CalendarCheck },
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/connections", label: "Health Connections", icon: Waypoints },
  { to: "/app/insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/reports", label: "Reports", icon: Gauge },
  { to: "/app/integrations", label: "Integrations", icon: Plug },
  { to: "/app/profile", label: "Profile", icon: UserIcon },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV: NavItem[] = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/app/activity", label: "Move", icon: Activity },
  { to: "/app/nutrition", label: "Food", icon: Apple },
  { to: "/app/sleep", label: "Sleep", icon: Moon },
  { to: "/app/insights", label: "AI", icon: Sparkles },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-raised text-foreground"
                : "text-muted-foreground hover:bg-raised/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" style={active ? { color: "var(--mint)" } : undefined} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
  eyebrow,
  action,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  const { user, notifications, markAllRead, markNotificationRead, signOut } = useHealthStore();
  const [open, setOpen] = useState(false);
  // Dashboard content is derived from the current date, which differs between the
  // prerendered HTML and the browser — render it only after hydration.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  const handleSignOut = () => {
    void signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-sidebar p-4 lg:flex">
          <Link to="/" className="mb-6 block px-1">
            <Logo />
          </Link>
          <div className="flex-1 overflow-y-auto pr-1">
            <NavList />
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <Link
              to="/app/settings"
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LifeBuoy className="h-4 w-4" /> Help &amp; Support
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] border-border bg-sidebar p-4">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <div className="mb-6">
                      <Logo />
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      <NavList onNavigate={() => setOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  {eyebrow ? (
                    <div className="font-mono truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {eyebrow}
                    </div>
                  ) : null}
                  <div className="font-display truncate text-sm font-bold uppercase tracking-[0.1em]">
                    {title}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {action}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                      {unread > 0 && (
                        <span
                          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                          style={{ background: "var(--salmon)" }}
                        />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      <button
                        className="font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          markAllRead();
                          toast.success("All notifications marked as read");
                        }}
                      >
                        Mark all read
                      </button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 6).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className="flex flex-col items-start gap-1 py-2.5"
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</span>
                            <span className="font-mono shrink-0 text-[10px] text-muted-foreground">
                              {n.time}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{n.body}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/app/notifications" className="flex items-center justify-between">
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-raised text-xs font-semibold"
                      aria-label="Account menu"
                    >
                      {user.fullName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="text-sm">{user.fullName}</div>
                      <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/app/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/app/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6">{hydrated ? children : null}</main>

          <footer className="px-4 pb-8 pt-2 sm:px-6">
            <div className="flex items-start gap-2 rounded-2xl border border-border bg-card/50 p-4">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                This application provides wellness insights for informational purposes and is not a
                substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-muted-foreground"
              activeProps={{ style: { color: "var(--mint)" } }}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-display text-[9px] uppercase tracking-[0.08em]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <HeartPulse className="hidden" />
    </div>
  );
}
