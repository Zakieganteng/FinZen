export default function AuthLayout({ children }) {
  // Layout 2 kolom untuk desktop, 1 kolom untuk mobile
  // Left: Branding, Right: Auth Form
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

