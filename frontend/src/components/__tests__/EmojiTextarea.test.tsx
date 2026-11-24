import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useState } from 'react'
import { EmojiTextarea } from '../EmojiTextarea'

function Harness({ readOnly = false, initial = '' }: { readOnly?: boolean; initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <label htmlFor="notes">Özel Notlar</label>
      <EmojiTextarea id="notes" value={value} onValueChange={setValue} readOnly={readOnly} />
      <output data-testid="value">{value}</output>
    </>
  )
}

describe('EmojiTextarea expand dialog', () => {
  it('edits the same form value in the dialog', () => {
    render(<Harness initial="Çağrı ✅" />)
    fireEvent.click(screen.getByRole('button', { name: 'Metni büyüt' }))
    expect(screen.getByRole('heading', { name: 'Özel Notlar' })).toBeInTheDocument()
    const dialogText = screen.getByRole('textbox', { name: 'Özel Notlar' })
    expect(dialogText).toHaveValue('Çağrı ✅')
    fireEvent.change(dialogText, { target: { value: 'Çağrı ✅ ek' } })
    fireEvent.click(screen.getByRole('button', { name: 'Bitti' }))
    expect(screen.getByTestId('value')).toHaveTextContent('Çağrı ✅ ek')
    expect(document.getElementById('notes')).toHaveValue('Çağrı ✅ ek')
  })

  it('keeps read-only fields read-only in the dialog', () => {
    render(<Harness readOnly initial="Salt okunur metin" />)
    fireEvent.click(screen.getByRole('button', { name: 'Metni büyüt' }))
    const dialogText = screen.getByRole('textbox', { name: 'Özel Notlar' })
    expect(dialogText).toHaveAttribute('readonly')
    expect(screen.getByText('Salt okunur')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Emoji ekle' })).toBeNull()
  })
})
