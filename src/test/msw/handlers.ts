import { http, HttpResponse } from 'msw'
import type { Digest } from '@/types/api'

export const digestFixture: Digest = {
  id: 'digest-test-1',
  date: '2026-08-20',
  slot: 'morning',
  title: 'Test Piyasa Özeti',
  content: 'Bu bir test içeriğidir.',
  sections: [
    { heading: 'BIST', body: 'Borsa İstanbul güne yükselişle başladı.' },
    { heading: 'Döviz', body: 'Dolar/TL yatay seyrediyor.' },
  ],
  metadata: {},
  language: 'tr',
  created_at: '2026-08-20T08:00:00Z',
}

export const handlers = [
  http.get('*/api/v1/digest', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.has('date') || url.searchParams.has('slot')) {
      return HttpResponse.json([])
    }
    return HttpResponse.json(digestFixture)
  }),
]
