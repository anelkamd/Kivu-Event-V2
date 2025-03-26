import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Header from "@/components/layout/Header"
import { AuthProvider } from "@/context/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

describe("Header Component", () => {
  const queryClient = new QueryClient()

  const renderHeader = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </QueryClientProvider>,
    )
  }

  it("renders the logo and navigation links", () => {
    renderHeader()

    // Logo
    expect(screen.getByText("Kivu Event")).toBeInTheDocument()

    // Navigation links
    expect(screen.getByText("Accueil")).toBeInTheDocument()
    expect(screen.getByText("Événements")).toBeInTheDocument()
    expect(screen.getByText("Lieux")).toBeInTheDocument()
    expect(screen.getByText("Intervenants")).toBeInTheDocument()
    expect(screen.getByText("À propos")).toBeInTheDocument()
  })

  it("renders login and register buttons when not authenticated", () => {
    renderHeader()

    expect(screen.getByText("Connexion")).toBeInTheDocument()
    expect(screen.getByText("Inscription")).toBeInTheDocument()
  })

  it("opens mobile menu when menu button is clicked", async () => {
    renderHeader()

    const menuButton = screen.getByRole("button", { name: /ouvrir le menu/i })
    await userEvent.click(menuButton)

    // Check if mobile menu is open
    expect(screen.getByRole("button", { name: /fermer le menu/i })).toBeInTheDocument()
  })
})

