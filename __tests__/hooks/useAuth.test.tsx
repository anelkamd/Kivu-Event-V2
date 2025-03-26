"use client"

import type React from "react"

import { renderHook, act } from "@testing-library/react-hooks"
import { useAuth, AuthProvider } from "@/context/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import axios from "@/lib/axios"
import Cookies from "js-cookie"

// Mock axios
jest.mock("@/lib/axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock js-cookie
jest.mock("js-cookie")
const mockedCookies = Cookies as jest.Mocked<typeof Cookies>

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe("useAuth Hook", () => {
  const queryClient = new QueryClient()

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes with default values", () => {
    mockedCookies.get.mockReturnValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it("logs in a user successfully", async () => {
    const mockUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "participant",
    }

    mockedAxios.post.mockResolvedValue({
      data: {
        token: "mock-token",
        data: mockUser,
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login("john@example.com", "password")
    })

    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", {
      email: "john@example.com",
      password: "password",
    })
    expect(mockedCookies.set).toHaveBeenCalledWith("token", "mock-token", { expires: 30 })
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it("logs out a user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(() => {
      result.current.logout()
    })

    expect(mockedCookies.remove).toHaveBeenCalledWith("token")
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})

