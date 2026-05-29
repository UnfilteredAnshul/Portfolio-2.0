export default function AdminProjectsLoading() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
    }}>
      <p style={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Loading...
      </p>
    </section>
  )
}