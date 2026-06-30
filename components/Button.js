import Link from "next/link";

const variants = {
  primary:
    "border-[#0F172A] bg-[#0F172A] text-white shadow-md shadow-slate-900/10 hover:border-slate-800 hover:bg-slate-800 hover:text-white",
  secondary:
    "border-[#0F172A] bg-white text-[#0F172A] shadow-sm hover:border-[#0F172A] hover:bg-slate-50 hover:text-[#0F172A]",
  ghost:
    "border-transparent bg-transparent text-[#0F172A] hover:bg-slate-100 hover:text-[#0F172A]",
  danger:
    "border-red-200 bg-white text-red-700 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-800",
};

const disabledClass =
  "pointer-events-none cursor-not-allowed !border-slate-300 !bg-slate-200 !text-slate-500 shadow-none hover:!border-slate-300 hover:!bg-slate-200 hover:!text-slate-500";

export default function Button({
  children,
  href,
  variant = "primary",
  disabled,
  onClick,
}) {
  const className = [
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-5 py-3 text-center text-sm font-bold transition sm:w-auto",
    "focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2",
    variants[variant] || variants.primary,
    disabled ? disabledClass : "",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={className} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
