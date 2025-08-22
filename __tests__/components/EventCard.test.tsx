import { render, screen } from '@testing-library/react'
import EventCard from '@/components/events/EventCard'

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    date: '2025-01-01',
    location: 'Test Location',
  }

  test('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />)
    
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument()
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument()
    expect(screen.getByText(mockEvent.location)).toBeInTheDocument()
  })
})