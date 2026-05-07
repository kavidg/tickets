export default function Button({ children, href, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition duration-200 focus:outline-none focus:ring-4 focus:ring-luxe-ember/25';
  const styles = {
    primary: 'border border-luxe-ember/30 bg-luxe-wine text-white shadow-xl shadow-black/35 hover:-translate-y-0.5 hover:bg-luxe-crimson hover:shadow-red-glow',
    secondary: 'border border-white/10 bg-white/[0.06] text-red-50 shadow-lg shadow-black/25 backdrop-blur-xl hover:border-luxe-ember/45 hover:bg-luxe-wine/30 hover:text-white',
    glow: 'border border-luxe-ember/45 bg-gradient-to-r from-luxe-crimson to-luxe-ember text-white shadow-2xl shadow-luxe-ember/25 hover:-translate-y-0.5 hover:from-luxe-wine hover:to-luxe-crimson hover:shadow-red-glow',
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
