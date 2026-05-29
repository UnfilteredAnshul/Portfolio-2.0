import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>404</h1>
      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.2rem', marginTop: '1rem' }}>
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: '#fff',
          color: '#000',
          textDecoration: 'none',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: '8px',
        }}
      >
        Go Home
      </Link>
    </section>
  )
}
