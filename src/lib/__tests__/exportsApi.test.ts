import { describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { createExport, listExports } from '@/lib/exportsApi'
import { server } from '@/test/msw/server'
import { exportsFixture } from '@/test/msw/handlers'

describe('listExports', () => {
  it('returns the parsed array on a 200 success', async () => {
    const result = await listExports()
    expect(result).toEqual(exportsFixture)
  })

  it('raises on a 5xx error', async () => {
    server.use(
      http.get('*/api/v1/data/export', () => HttpResponse.json(null, { status: 500 })),
    )
    await expect(listExports()).rejects.toBeTruthy()
  })

  it('raises on a 4xx error', async () => {
    server.use(
      http.get('*/api/v1/data/export', () => HttpResponse.json(null, { status: 403 })),
    )
    await expect(listExports()).rejects.toBeTruthy()
  })

  it('returns an empty array when the payload is neither an array nor a wrapper', async () => {
    server.use(http.get('*/api/v1/data/export', () => HttpResponse.json({})))
    const result = await listExports()
    expect(result).toEqual([])
  })
})

describe('createExport', () => {
  it('returns the parsed payload on a 200 success', async () => {
    const result = await createExport(2026, 'csv')
    expect(result).toEqual({ export_id: 1, status: 'queued' })
  })

  it('raises on a 4xx error', async () => {
    server.use(
      http.post('*/api/v1/data/export', () => HttpResponse.json(null, { status: 400 })),
    )
    await expect(createExport(2026, 'csv')).rejects.toBeTruthy()
  })

  it('raises on a 5xx error', async () => {
    server.use(
      http.post('*/api/v1/data/export', () => HttpResponse.json(null, { status: 500 })),
    )
    await expect(createExport(2026, 'csv')).rejects.toBeTruthy()
  })
})
