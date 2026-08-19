import { describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { fetchCurrentDigest, fetchDigestsByDate } from '@/lib/digestApi'
import { server } from '@/test/msw/server'
import { digestFixture } from '@/test/msw/handlers'
import type { Digest } from '@/types/api'

describe('fetchCurrentDigest', () => {
  it('returns the parsed Digest on a 200 with a full payload', async () => {
    const digest = await fetchCurrentDigest()
    expect(digest).toEqual(digestFixture)
  })

  it('returns null on a 404', async () => {
    server.use(
      http.get('*/api/v1/digest', () => HttpResponse.json(null, { status: 404 })),
    )
    const digest = await fetchCurrentDigest()
    expect(digest).toBeNull()
  })

  it('rejects on a 5xx error', async () => {
    server.use(
      http.get('*/api/v1/digest', () => HttpResponse.json(null, { status: 500 })),
    )
    await expect(fetchCurrentDigest()).rejects.toBeTruthy()
  })

  it('rejects on a network error', async () => {
    server.use(http.get('*/api/v1/digest', () => HttpResponse.error()))
    await expect(fetchCurrentDigest()).rejects.toBeTruthy()
  })
})

describe('fetchDigestsByDate', () => {
  it('returns the array on a 200 with a list payload', async () => {
    const list: Digest[] = [
      { ...digestFixture, id: 'digest-1' },
      { ...digestFixture, id: 'digest-2', slot: 'evening' },
    ]
    server.use(http.get('*/api/v1/digest', () => HttpResponse.json(list)))

    const result = await fetchDigestsByDate('2026-08-20')
    expect(result).toEqual(list)
  })

  it('returns an empty array on a 200 with an empty payload', async () => {
    server.use(http.get('*/api/v1/digest', () => HttpResponse.json([])))

    const result = await fetchDigestsByDate('2026-08-20')
    expect(result).toEqual([])
  })
})
