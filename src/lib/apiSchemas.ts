import { z, type ZodType } from 'zod'

const companySummarySchema = z.object({
  ticker: z.string(),
  name: z.string(),
  sector: z.string().nullable(),
  last_price: z.number().nullable(),
  change_pct: z.number().nullable(),
  day_high: z.number().nullable(),
  day_low: z.number().nullable(),
  volume: z.number().nullable(),
  market_cap: z.number().nullable(),
  currency: z.string().nullable(),
  price_updated_at: z.string().nullable(),
})

export const companySummaryResponseSchema = z.object({
  data: z.array(companySummarySchema),
  total: z.number().int().nonnegative(),
})

export const favoritesResponseSchema = z.object({
  favorites: z.array(z.string()),
})

export const newsItemsSchema = z.array(z.object({
  url: z.string(),
  title: z.string(),
  lang: z.string().nullable(),
  date: z.string().nullable(),
}))

export const announcementsResponseSchema = z.object({
  announcements: z.array(z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    sent_by: z.union([z.string(), z.number()]).nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    is_unread: z.boolean(),
  })),
})

export function parseApi<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data)
}
