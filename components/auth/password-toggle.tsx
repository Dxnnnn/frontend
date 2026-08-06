interface PasswordToggleProps {
  showPassword: boolean;
  onToggle: () => void;
}

export function PasswordToggle({
  showPassword,
  onToggle,
}: PasswordToggleProps) {
  const iconSrc = showPassword ? "/icons/eye-off.png" : "/icons/eye-open.png";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group absolute inset-y-0 right-0 flex items-center px-4"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      <span
        aria-hidden="true"
        className="block h-5 w-5 bg-slate-700 transition group-hover:bg-brand-700"
        style={{
          WebkitMaskImage: `url(${iconSrc})`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: `url(${iconSrc})`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />
    </button>
  );
}
