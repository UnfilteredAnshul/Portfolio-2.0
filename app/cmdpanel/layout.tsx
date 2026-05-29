import type { ReactNode } from 'react'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        .top-nav { display: none !important; }
        body > footer { display: none !important; }
      `}</style>
      {children}
    </>
  )
}