/**
 * Reusable button component with modern variants.
 * Supports rendering as <button> or <a> when href is provided.
 */
export default function Button({ children, href = '', variant = 'primary', className = '', size = 'default', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50';

  const sizes = {
    sm: 'rounded-lg px-4 py-2 text-xs gap-1.5',
    default: 'rounded-xl px-6 py-3 text-sm gap-2',
    lg: 'rounded-xl px-8 py-4 text-base gap-2.5',
  };

  const styles = {
    primary: 'bg-brand text-white shadow-button hover:bg-brand-light hover:shadow-glow',
    secondary: 'border border-white/[0.1] bg-neutral-800 text-neutral-200 shadow-sm hover:border-white/20 hover:bg-neutral-700 hover:text-white',
    outline: 'border border-brand/40 text-brand-light hover:bg-brand-muted hover:text-brand-light',
    ghost: 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200',
    glow: 'bg-brand text-white shadow-glow-lg hover:bg-brand-light hover:shadow-glow',
  };

  const classes = `${base} ${sizes[size]} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
