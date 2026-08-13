import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface NumberInputProps {
  /** Ham sayısal değer (ondalık ayracı nokta, örn. "100000.5"). */
  value: string
  /** Ham sayısal değeri (nokta ayraçlı) verir; backend parseFloat virgül kabul etmez. */
  onChange: (raw: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

/** "100.000,50" veya "100000" gibi tr-TR gösterimini nokta ayraçlı ham değere çevirir. */
function parseDisplayToRaw(display: string): string {
  const s = display.trim().replace(/\s+/g, '')
  if (!s) return ''
  if (s.includes(',')) {
    // Virgül ondalık ayracı; noktalar binlik ayracı.
    return s.replace(/\./g, '').replace(',', '.')
  }
  const parts = s.split('.')
  if (parts.length === 1) return s
  if (parts.length === 2) return s
  // Birden fazla nokta: hepsi 3 haneli grupsa binlik ayracı, değilse sonuncusu ondalık.
  const lastLen = parts[parts.length - 1].length
  const allGrouped = parts.every((p) => p.length === 3)
  if (lastLen === 3 && allGrouped) return parts.join('')
  return `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`
}

/** Ham değeri tr-TR gösterimine çevirir (örn. "100000.5" -> "100.000,5"). */
function toDisplay(raw: string): string {
  if (!raw) return ''
  const n = Number(raw)
  if (!Number.isFinite(n)) return raw
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 6 })
}

/**
 * tr-TR sayı girişi: virgülü ondalık ayracı olarak kabul eder, noktayı binlik
 * ayracı olarak yorumlar; onChange her zaman nokta ayraçlı ham değer verir,
 * onBlur'da değeri tr-TR formatında gösterir.
 */
export function NumberInput({ value, onChange, placeholder, className, disabled, id }: NumberInputProps) {
  const [display, setDisplay] = useState(() => toDisplay(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) {
      setDisplay(toDisplay(value))
    }
  }, [value, focused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.replace(/[^\d.,\s]/g, '')
    const raw = parseDisplayToRaw(typed)
    if (raw !== '' && !Number.isFinite(Number(raw))) return
    onChange(raw)
    setDisplay(typed)
  }

  const handleFocus = () => {
    setFocused(true)
    setDisplay(value)
  }

  const handleBlur = () => {
    setFocused(false)
    setDisplay(toDisplay(value))
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      id={id}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  )
}
