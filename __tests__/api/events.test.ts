import { createEvent, getEvent, updateEvent, deleteEvent } from '@/services/eventService'

describe('Event API', () => {
  const mockEvent = {
    title: 'Test Event',
    description: 'Test Description',
    type: 'conference',
    startDate: '2025-01-01',
    endDate: '2025-01-02',
    capacity: 100,
  }

  test('should create a new event', async () => {
    const response = await createEvent(mockEvent)
    expect(response.success).toBe(true)
    expect(response.data.title).toBe(mockEvent.title)
  })

  test('should get event by id', async () => {
    const event = await getEvent('some-id')
    expect(event).toBeDefined()
  })
})