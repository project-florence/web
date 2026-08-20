import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import ForgotPasswordPage from '../ForgotPasswordPage'

describe('ForgotPasswordPage render', () => {
  it('does not crash on load', () => {
    expect(() =>
      render(
        <MemoryRouter>
          <I18nextProvider i18n={i18n}>
            <ForgotPasswordPage />
          </I18nextProvider>
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })
})
