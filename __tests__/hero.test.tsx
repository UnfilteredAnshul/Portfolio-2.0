import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Hero3D from '../components/Hero3D'

describe('Hero3D', () => {
  it('renders without crashing', () => {
    const { container } = render(<Hero3D />)
    expect(container).toBeInTheDocument()
  })
})
