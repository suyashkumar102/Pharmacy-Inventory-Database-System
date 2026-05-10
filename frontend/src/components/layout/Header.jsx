import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Menu, Search, Bell, Sun, Moon, ChevronDown, LogOut, Settings, User,
  Pill, Users, Stethoscope, FileText, AlertTriangle, CheckCircle2, X,
  ArrowRight, Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useTheme } from "../../contexts/ThemeContext";
import { useCurrentUser, useNotifications } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const API = process.env.REACT_APP_BACKEND_URL;

// ────── Live Search Component ──────
const LiveSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ drugs: [], patients: [], doctors: [], prescriptions: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Build flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const items = [];
    results.drugs.forEach(d => items.push({ type: "drug", data: d, path: "/drugs", label: d.name, sub: d.categoryId }));
    results.patients.forEach(p => items.push({ type: "patient", data: p, path: "/patients", label: p.name, sub: `${p.city} · ${p.phone}` }));
    results.doctors.forEach(d => items.push({ type: "doctor", data: d, path: "/doctors", label: d.name, sub: d.qualification }));
    results.prescriptions.forEach(rx => items.push({ type: "prescription", data: rx, path: "/prescriptions", label: `#${rx.id}`, sub: `${rx.patient?.name || "Unknown"} · ${rx.status}` }));
    return items;
  }, [results]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ drugs: [], patients: [], doctors: [], prescriptions: [] });
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query.trim().toLowerCase();
        const [drugsRes, patientsRes, doctorsRes, rxRes] = await Promise.all([
          fetch(`${API}/api/drugs`).then(r => r.json()).catch(() => []),
          fetch(`${API}/api/patients`).then(r => r.json()).catch(() => []),
          fetch(`${API}/api/doctors`).then(r => r.json()).catch(() => []),
          fetch(`${API}/api/prescriptions`).then(r => r.json()).catch(() => []),
        ]);
        setResults({
          drugs: drugsRes.filter(d => d.name?.toLowerCase().includes(q) || d.categoryId?.toLowerCase().includes(q)).slice(0, 4),
          patients: patientsRes.filter(p => p.name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.city?.toLowerCase().includes(q)).slice(0, 4),
          doctors: doctorsRes.filter(d => d.name?.toLowerCase().includes(q) || d.qualification?.toLowerCase().includes(q)).slice(0, 4),
          prescriptions: rxRes.filter(rx => rx.id?.toLowerCase().includes(q) || rx.patient?.name?.toLowerCase().includes(q) || rx.doctor?.name?.toLowerCase().includes(q)).slice(0, 4),
        });
        setIsOpen(true);
        setActiveIdx(-1);
      } catch { /* ignore */ }
      finally { setIsSearching(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goTo = useCallback((item) => {
    const q = encodeURIComponent(query.trim());
    navigate(`${item.path}?q=${q}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  }, [navigate, query]);

  const handleKeyDown = (e) => {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === "Escape") { setIsOpen(false); inputRef.current?.blur(); }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < flatItems.length) {
        goTo(flatItems[activeIdx]);
      } else if (flatItems.length > 0) {
        goTo(flatItems[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const total = flatItems.length;

  const typeIcon = (type) => {
    switch (type) {
      case "drug":         return <Pill className="h-4 w-4 text-emerald-500" />;
      case "patient":      return <Users className="h-4 w-4 text-blue-500" />;
      case "doctor":       return <Stethoscope className="h-4 w-4 text-purple-500" />;
      case "prescription": return <FileText className="h-4 w-4 text-orange-500" />;
      default:             return null;
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case "drug":         return "Drug";
      case "patient":      return "Patient";
      case "doctor":       return "Doctor";
      case "prescription": return "Prescription";
      default:             return "";
    }
  };

  let runIdx = -1;

  return (
    <div className="relative flex-1 max-w-2xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {isSearching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <Input
        ref={inputRef}
        data-testid="global-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query.trim() && total > 0) setIsOpen(true); }}
        placeholder="Search across drugs, patients, doctors, prescriptions…"
        className="h-12 w-full rounded-2xl border-border/60 bg-secondary/40 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
      />

      {/* Results dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl animate-fade-in"
        >
          {total === 0 && !isSearching && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Search className="h-6 w-6 opacity-40" />
              <span className="text-sm">No results for "{query}"</span>
            </div>
          )}

          {total > 0 && (
            <ScrollArea className="max-h-[360px]">
              {["drugs", "patients", "doctors", "prescriptions"].map((key) => {
                const items = results[key];
                if (items.length === 0) return null;
                const typeName = key === "drugs" ? "drug" : key === "patients" ? "patient" : key === "doctors" ? "doctor" : "prescription";
                return (
                  <div key={key}>
                    <div className="sticky top-0 z-10 flex items-center gap-2 bg-popover/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                      {typeIcon(typeName)}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
                        {items.length}
                      </Badge>
                    </div>
                    {items.map((item) => {
                      runIdx++;
                      const idx = runIdx;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={`${key}-${item.id}`}
                          onClick={() => goTo({ type: typeName, data: item, path: `/${key}`, label: item.name || item.id })}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                            isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"
                          )}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            {typeIcon(typeName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name || `#${item.id}`}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {typeName === "drug" && `₹${item.price} · ${item.stock} in stock`}
                              {typeName === "patient" && `${item.city || ""} · ${item.phone || ""}`}
                              {typeName === "doctor" && `${item.qualification || ""}`}
                              {typeName === "prescription" && `${item.patient?.name || "—"} · ${item.status}`}
                            </div>
                          </div>
                          <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 transition-opacity", isActive ? "opacity-100 text-primary" : "opacity-0")} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="border-t border-border px-4 py-2 text-center">
                <span className="text-xs text-muted-foreground">{total} result{total !== 1 ? "s" : ""} · Press ↑↓ to navigate, Enter to go</span>
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

// ────── Notification System ──────
const NotificationPanel = () => {
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  // Normalise all IDs to strings so localStorage roundtrip never breaks Set.has()
  const toKey = (id) => String(id);

  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("pipms_read_notifs") || "[]")); }
    catch { return new Set(); }
  });

  // Persist read IDs
  useEffect(() => {
    localStorage.setItem("pipms_read_notifs", JSON.stringify([...readIds]));
  }, [readIds]);

  const unreadCount = notifications.filter(n => !readIds.has(toKey(n.id))).length;

  const markAsRead = (id) => {
    setReadIds(prev => new Set([...prev, toKey(id)]));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => toKey(n.id))));
  };

  const clearAll = () => {
    setReadIds(new Set(notifications.map(n => toKey(n.id))));
    setNotifOpen(false);
  };

  // Navigate to the specific drug or prescription that triggered the notification
  const handleClick = (n) => {
    markAsRead(n.id);
    setNotifOpen(false);
    if (n.type === "warning") {
      // n.title is like "Amoxicillin 500mg low stock (3 left)" — extract drug name
      const drugName = n.title.split(" low stock")[0].trim();
      navigate(`/drugs?q=${encodeURIComponent(drugName)}`);
    } else {
      // n.title is like "New prescription from Dr. Smith" — go to prescriptions list
      navigate("/prescriptions");
    }
  };

  const getIcon = (n) => {
    if (n.type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Popover open={notifOpen} onOpenChange={setNotifOpen}>
      <PopoverTrigger asChild>
        <Button
          data-testid="notifications-button"
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className={cn("h-5 w-5 transition-transform", notifOpen && "scale-110")} />
          {unreadCount > 0 && (
            <Badge
              data-testid="notifications-badge"
              className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full border-2 border-topbar bg-red-500 px-1 text-[10px] font-bold text-white hover:bg-red-500 animate-fade-in"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="font-semibold text-foreground">Notifications</div>
            <div className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-8 text-xs text-primary hover:text-primary"
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <span className="text-sm">No notifications</span>
            </div>
          )}
          {notifications.map((n) => {
            const isRead = readIds.has(toKey(n.id));
            return (
              <div
                key={n.id}
                data-testid={`notification-item-${n.id}`}
                onClick={() => handleClick(n)}
                className={cn(
                  "group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all hover:bg-secondary/50 border-l-2",
                  isRead
                    ? "border-l-transparent opacity-60"
                    : "border-l-primary bg-primary/[0.03]"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  n.type === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"
                )}>
                  {getIcon(n)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-sm text-foreground",
                    !isRead && "font-semibold"
                  )}>
                    {n.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{n.time}</span>
                    <span className="text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.type === "warning" ? "→ View Drug" : "→ View Prescriptions"}
                    </span>
                  </div>
                </div>

                {/* Unread dot */}
                {!isRead && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}

                {/* Dismiss X — use onPointerDown so it fires before Radix's outside-click handler */}
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    markAsRead(n.id);
                  }}
                  className="mt-0.5 rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

  // ────── Profile Dialog ──────
const ProfileDialog = ({ open, onOpenChange, user }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm rounded-2xl">
      <DialogHeader>
        <DialogTitle>My Profile</DialogTitle>
        <DialogDescription>Your account information</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-20 w-20 border-2 border-primary/30">
          <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <Badge className="mt-2 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium">
            {user.role}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Username</span>
          <span className="font-medium">{user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role</span>
          <span className="font-medium">{user.role}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium text-chart-green">Active</span>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// ────── Settings Sheet ──────
const SettingsSheet = ({ open, onOpenChange, theme, toggleTheme }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-80">
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription>Manage your preferences</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-6">
        {/* Appearance */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
            <div className="flex items-center gap-3">
              {theme === "dark"
                ? <Moon className="h-4 w-4 text-primary" />
                : <Sun className="h-4 w-4 text-primary" />}
              <div>
                <div className="text-sm font-medium">{theme === "dark" ? "Dark" : "Light"} Mode</div>
                <div className="text-xs text-muted-foreground">Switch interface theme</div>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </div>

        {/* System */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Info</div>
          <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/20 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System</span>
              <span className="font-medium">PIPMS v1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium text-chart-green">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium text-chart-green">MySQL</span>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

// ────── Sign Out Dialog ──────
const SignOutDialog = ({ open, onOpenChange }) => {
  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of PIPMS. Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ────── User Menu ──────
const UserMenu = ({ user, theme, toggleTheme }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            data-testid="user-menu-trigger"
            className="ml-1 flex items-center gap-2.5 rounded-2xl border border-border/60 bg-secondary/40 px-2 py-1.5 transition-colors hover:bg-secondary"
          >
            <Avatar className="h-8 w-8 border border-primary/30">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-testid="user-menu-profile"
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="user-menu-settings"
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-testid="user-menu-logout"
            onClick={() => setSignOutOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} user={user} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} theme={theme} toggleTheme={toggleTheme} />
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  );
};

// ────── Main Header ──────
export const Header = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { data: user } = useCurrentUser();

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-border bg-topbar/80 px-4 backdrop-blur-xl md:px-6"
    >
      <Button
        data-testid="sidebar-toggle"
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <LiveSearch />

      <div className="flex items-center gap-1.5">
        <NotificationPanel />

        {/* Theme toggle */}
        <Button
          data-testid="theme-toggle"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <UserMenu user={user} theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};

