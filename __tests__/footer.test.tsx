import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

vi.mock('next/navigation', () => ({
  usePathname: () => '/work',
}))

describe('Footer', () => {
  it('renders social links', () => {
    render(<Footer />)
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
  })

  it('renders copyright with current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} Anshul Rajpal`)).toBeInTheDocument()
  })

  it('has correct href for Instagram', () => {
    render(<Footer />)
    const link = screen.getByLabelText('Instagram')
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/shutup.krish/')
  })

  it('has correct href for YouTube', () => {
    render(<Footer />)
    const link = screen.getByLabelText('YouTube')
    expect(link).toHaveAttribute('href', 'https://yt.openinapp.co/5exylink')
  })

  it('has correct href for LinkedIn', () => {
    render(<Footer />)
    const link = screen.getByLabelText('LinkedIn')
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/unfiltred-anshul-rajpal/')
  })
})
