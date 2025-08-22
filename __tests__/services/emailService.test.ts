import { sendEventConfirmation } from '@/services/emailService'

describe('EmailService', () => {
  test('should send event confirmation email', async () => {
    const mockData = {
      to: 'test@example.com',
      eventTitle: 'Test Event',
      date: '2025-01-01',
    }

    const result = await sendEventConfirmation(mockData)
    expect(result.success).toBe(true)
  })
})