"use client";

interface MaskedPasswordProps {
  password: string;
  visible: boolean;
}

export function MaskedPassword({ password, visible }: MaskedPasswordProps) {
  if (visible) {
    return <span className="font-mono text-sm text-slate-700">{password}</span>;
  }

  return (
    <span className="font-mono text-sm tracking-widest text-slate-400">
      {"•".repeat(Math.max(password.length, 8))}
    </span>
  );
}
