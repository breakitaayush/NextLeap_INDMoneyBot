import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass =
    variant === "primary" ? "primary-button" : variant === "secondary" ? "secondary-button" : "focus-ring rounded-2xl px-4 py-3 text-sm font-semibold text-ayuva-greenDark transition hover:bg-ayuva-mint dark:text-emerald-100 dark:hover:bg-white/10";

  return <button className={`${variantClass} ${className}`} {...props} />;
}
