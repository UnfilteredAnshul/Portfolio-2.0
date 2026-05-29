import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '../app/not-found'

describe('404 page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<NotFound />)
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    render(<NotFound />)
    const link = screen.getByText('Go Home')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
