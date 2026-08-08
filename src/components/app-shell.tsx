"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Gauge,
  GitBranch,
  HelpCircle,
  LayoutGrid,
  LifeBuoy,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: typeof Gauge };

const primaryNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Gauge },
  { label: "Submissions", href: "/admin/submissions", icon: ClipboardList },
  { label: "Evaluations", href: "/admin/evaluations", icon: BarChart3 },
  { label: "Speakers", href: "/admin/onboarding", icon: Users },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
];

const configNav: NavItem[] = [
  { label: "CFP form", href: "/admin/forms", icon: FileText },
  { label: "Routing", href: "/admin/routing", icon: GitBranch },
  { label: "Communications", href: "/admin/communications", icon: Mail },
  { label: "Integrations", href: "/admin/integrations", icon: Sparkles },
];

export function AppShell({
  children,
  active,
  title,
  eyebrow,
  description,
  action,
  compact = false,
}: {
  children: React.ReactNode;
  active?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function resetDemo() {
    setResetting(true);
    await fetch("/api/demo/reset", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="app-frame">
      <aside
        className={`app-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
      >
        <div className="brand-lockup">
          <Link href="/" className="brand-mark" aria-label="ProgramLoom home">
            <span className="brand-glyph">
              <LayoutGrid size={17} strokeWidth={2.5} />
            </span>
            {!collapsed && <span>ProgramLoom</span>}
          </Link>
          <button
            className="icon-button sidebar-dismiss"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        {!collapsed && (
          <button className="event-switcher" type="button">
            <span className="event-dot" />
            <span className="event-switcher-copy">
              <strong>AI Engineer</strong>
              <small>Sandbox Summit</small>
            </span>
            <ChevronDown size={15} />
          </button>
        )}
        <nav className="sidebar-nav" aria-label="Program navigation">
          <NavGroup
            label={!collapsed ? "WORKSPACE" : undefined}
            items={primaryNav}
            active={active ?? pathname}
            collapsed={collapsed}
            onNavigate={() => setMobileOpen(false)}
          />
          <NavGroup
            label={!collapsed ? "CONFIGURE" : undefined}
            items={configNav}
            active={active ?? pathname}
            collapsed={collapsed}
            onNavigate={() => setMobileOpen(false)}
          />
        </nav>
        {!collapsed && (
          <div className="sidebar-bottom">
            <Link href="/demo" className="sidebar-link">
              <Sparkles size={16} />
              <span>Demo center</span>
              <span className="nav-kicker">⌘K</span>
            </Link>
            <Link href="/api/docs" className="sidebar-link">
              <ShieldCheck size={16} />
              <span>API &amp; docs</span>
            </Link>
            <Link href="/admin/settings" className="sidebar-link">
              <Settings2 size={16} />
              <span>Settings</span>
            </Link>
            <div className="sidebar-help">
              <div className="avatar avatar-teal">CK</div>
              <div>
                <strong>Demo workspace</strong>
                <small>Local persistence</small>
              </div>
              <HelpCircle size={15} />
            </div>
          </div>
        )}
        <button
          className="collapse-button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}{" "}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="app-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumb">
            <span>AI Engineer Sandbox Summit</span>
            <span className="breadcrumb-separator">/</span>
            <span>{eyebrow ?? "Workspace"}</span>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <span className="pulse-dot" /> Demo mode
            </span>
            <button className="topbar-link" onClick={resetDemo} disabled={resetting}>
              <RefreshCw size={14} className={resetting ? "spin" : ""} />{" "}
              {resetting ? "Resetting" : "Reset demo"}
            </button>
            <div className="avatar avatar-navy">CK</div>
          </div>
        </header>
        <div className={`page-container ${compact ? "page-container-compact" : ""}`}>
          {(title || description || action) && (
            <div className="page-heading">
              <div>
                <div className="eyebrow">{eyebrow ?? "Workspace"}</div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
              </div>
              <div className="heading-actions">{action}</div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

function NavGroup({
  label,
  items,
  active,
  collapsed,
  onNavigate,
}: {
  label?: string;
  items: NavItem[];
  active: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="nav-group">
      {label && <div className="nav-label">{label}</div>}
      {items.map(({ label: itemLabel, href, icon: Icon }) => {
        const selected = active === href || (href !== "/admin" && active.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`sidebar-link ${selected ? "is-active" : ""}`}
            title={collapsed ? itemLabel : undefined}
          >
            <Icon size={17} />
            <span>{!collapsed && itemLabel}</span>
            {!collapsed && selected && <span className="active-bar" />}
          </Link>
        );
      })}
    </div>
  );
}
