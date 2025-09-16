import React, { forwardRef } from "react";

/** utilitaire simple pour concaténer des classes */
const cx = (...c) => c.filter(Boolean).join(" ");

const base =
  "rounded-2xl border bg-white/70 dark:bg-zinc-900/60 text-inherit shadow-sm backdrop-blur-sm";

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cx(base, className)} {...props} />;
});

export const CardHeader = forwardRef(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "p-4 sm:p-6 border-b border-black/5 dark:border-white/10",
        className
      )}
      {...props}
    />
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cx("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});

export const CardDescription = forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cx("text-sm text-neutral-600 dark:text-neutral-400", className)}
      {...props}
    />
  );
});

export const CardContent = forwardRef(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cx("p-4 sm:p-6", className)} {...props} />;
});

export const CardFooter = forwardRef(function CardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "p-4 sm:p-6 border-t border-black/5 dark:border-white/10",
        className
      )}
      {...props}
    />
  );
});

// Compatibilité : default + nommés
export default Card;
