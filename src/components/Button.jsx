export default function Button({ children, href, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-200';
  const styles = {
    primary: 'bg-slate-950 text-white shadow-xl shadow-cyan-950/20 hover:-translate-y-0.5 hover:bg-cyan-700',
    secondary: 'border border-slate-200 bg-white/80 text-slate-950 backdrop-blur hover:border-cyan-300 hover:text-cyan-700',
    glow: 'bg-cyan-400 text-slate-950 shadow-2xl shadow-cyan-400/30 hover:-translate-y-0.5 hover:bg-lime-300',
  };

  const classes = `${base} ${styles[variant]} ${className}`;

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
