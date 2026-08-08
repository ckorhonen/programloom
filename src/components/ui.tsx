"use client";

import { ArrowUpRight, Check, ChevronRight, CircleAlert, Info, LoaderCircle } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled = false,
  icon,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const className = `button button-${variant}`;
  if (href)
    return (
      <a className={className} href={href}>
        {icon}
        {children}
        {variant === "ghost" && <ArrowUpRight size={15} />}
      </a>
    );
  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "orange" | "red" | "purple" | "blue";
}) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
export function Card({
  children,
  className = "",
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section className={`card ${padding ? "card-padded" : ""} ${className}`}>{children}</section>
  );
}
export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  icon = <Info size={20} />,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
export function ProgressBar({
  value,
  tone = "teal",
}: {
  value: number;
  tone?: "teal" | "orange" | "purple";
}) {
  return (
    <div className="progress-track">
      <div
        className={`progress-fill progress-${tone}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
export function StatCard({
  label,
  value,
  detail,
  tone = "teal",
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "teal" | "orange" | "purple" | "navy";
  icon?: React.ReactNode;
}) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function AlertBanner({
  children,
  tone = "warning",
}: {
  children: React.ReactNode;
  tone?: "warning" | "info" | "success";
}) {
  return (
    <div className={`alert-banner alert-${tone}`}>
      {tone === "warning" ? (
        <CircleAlert size={17} />
      ) : tone === "success" ? (
        <Check size={17} />
      ) : (
        <Info size={17} />
      )}
      <span>{children}</span>
    </div>
  );
}
export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  );
}
export function LinkRow({
  href,
  children,
  meta,
}: {
  href: string;
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <a className="link-row" href={href}>
      <span>{children}</span>
      {meta}
      <ChevronRight size={16} />
    </a>
  );
}
export function LoadingLabel({ children = "Working" }: { children?: React.ReactNode }) {
  return (
    <span className="loading-label">
      <LoaderCircle size={14} className="spin" />
      {children}
    </span>
  );
}
