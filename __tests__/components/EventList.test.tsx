import { render, screen } from "@testing-library/react"
import EventList from "@/components/events/EventList"
import type { Event } from "@/types"

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

describe("EventList Component", () => {
  const mockEvents: Event[] = [
    {
      id: "1",
      title: "Test Event 1",
      description: "This is a test event",
      type: "conference",
      startDate: "2023-12-01T09:00:00Z",
      endDate: "2023-12-01T17:00:00Z",
      capacity: 100,
      registrationDeadline: "2023-11-25T00:00:00Z",
      status: "published",
      venue: {
        id: "1",
        name: "Test Venue",
        street: "123 Test St",
        city: "Test City",
        country: "Test Country",
        capacity: 200,
        facilities: [],
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      organizer: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "organizer",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      speakers: [],
      agenda: [],
      participants: [],
      tags: ["test", "conference"],
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Test Event 2",
      description: "This is another test event",
      type: "workshop",
      startDate: "2023-12-15T10:00:00Z",
      endDate: "2023-12-15T16:00:00Z",
      capacity: 50,
      registrationDeadline: "2023-12-10T00:00:00Z",
      status: "draft",
      venue: {
        id: "2",
        name: "Another Venue",
        street: "456 Test Ave",
        city: "Another City",
        country: "Test Country",
        capacity: 100,
        facilities: [],
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      organizer: {
        id: "2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: "organizer",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      speakers: [],
      agenda: [],
      participants: [],
      tags: ["test", "workshop"],
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
  ]

  it("renders a list of events", () => {
    render(<EventList events={mockEvents} />)

    // Check if event titles are rendered
    expect(screen.getByText("Test Event 1")).toBeInTheDocument()
    expect(screen.getByText("Test Event 2")).toBeInTheDocument()

    // Check if event types are rendered
    expect(screen.getByText("Conférence")).toBeInTheDocument()
    expect(screen.getByText("Atelier")).toBeInTheDocument()

    // Check if event statuses are rendered
    expect(screen.getByText("Publié")).toBeInTheDocument()
    expect(screen.getByText("Brouillon")).toBeInTheDocument()

    // Check if venue information is rendered
    expect(screen.getByText("Test Venue, Test City")).toBeInTheDocument()
    expect(screen.getByText("Another Venue, Another City")).toBeInTheDocument()
  })

  it("renders empty state when no events are provided", () => {
    render(<EventList events={[]} />)

    // The component should render an empty grid
    const grid = screen.getByRole("list")
    expect(grid.children.length).toBe(0)
  })
})

