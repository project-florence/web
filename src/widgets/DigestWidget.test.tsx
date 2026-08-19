import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HttpResponse, http } from 'msw'
import DigestWidget from '@/widgets/DigestWidget'
import { server } from '@/test/msw/server'
import { digestFixture } from '@/test/msw/handlers'

function renderWidget() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <DigestWidget />
    </QueryClientProvider>,
  )
}

describe('DigestWidget', () => {
  it('renders the mocked digest title and a section', async () => {
    renderWidget()

    await waitFor(() => {
      expect(screen.getByText(digestFixture.title)).toBeInTheDocument()
    })

    expect(screen.getByText('BIST')).toBeInTheDocument()
    expect(
      screen.getByText('Borsa İstanbul güne yükselişle başladı.'),
    ).toBeInTheDocument()
  })

  it('shows the no-digest empty state when the API returns 404', async () => {
    server.use(
      http.get('*/api/v1/digest', () => HttpResponse.json(null, { status: 404 })),
    )

    renderWidget()

    await waitFor(() => {
      expect(
        screen.getByText('Henüz piyasa özeti yayınlanmadı'),
      ).toBeInTheDocument()
    })
  })
})
