/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushReact, renderReact } from '../test/reactTestUtils'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock('../api', () => ({
  categoriesApi: {
    list: mocks.list,
    create: mocks.create,
    update: mocks.update,
    remove: mocks.remove,
  },
  isApiError: () => false,
}))

vi.mock('../components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}))

import { CategoriesPage } from './CategoriesPage'

const category = {
  id: 1,
  title: 'Cabañas',
  description: 'Refugios entre montañas.',
  imageUrl: 'https://example.com/cabanas.jpg',
}
const cleanups: Array<() => Promise<void>> = []

function button(container: HTMLElement, text: string) {
  const result = [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(item => item.textContent === text)
  if (!result) throw new Error(`No se encontró el botón ${text}`)
  return result
}

beforeEach(() => {
  mocks.list.mockReset().mockResolvedValue([category])
  mocks.create.mockReset()
  mocks.update.mockReset()
  mocks.remove.mockReset()
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

describe('CategoriesPage', () => {
  it('identifica la categoría, explica la consecuencia y permite cancelar sin llamar a la API', async () => {
    const view = await renderReact(<CategoriesPage />)
    cleanups.push(view.cleanup)
    await flushReact()
    const deleteButton = button(view.container, 'Eliminar')

    await act(async () => deleteButton.click())

    const dialog = view.container.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog?.textContent).toContain('Eliminar “Cabañas”')
    expect(dialog?.textContent).toContain('Los productos no se borrarán')
    expect(dialog?.textContent).toContain('el sistema impedirá la eliminación')

    await act(async () => button(view.container, 'Cancelar').click())

    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(view.container.textContent).toContain('Cabañas')
  })

  it('cierra con Escape, devuelve el foco y conserva la categoría ante un conflicto', async () => {
    mocks.remove.mockRejectedValue(new Error('La categoría tiene productos asociados y no puede eliminarse.'))
    const view = await renderReact(<CategoriesPage />)
    cleanups.push(view.cleanup)
    await flushReact()
    const deleteButton = button(view.container, 'Eliminar')
    deleteButton.focus()

    await act(async () => deleteButton.click())
    expect(document.activeElement).toBe(button(view.container, 'Cancelar'))

    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(deleteButton)

    await act(async () => deleteButton.click())
    await act(async () => {
      button(view.container, 'Confirmar eliminación').click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mocks.remove).toHaveBeenCalledWith(category.id)
    expect(view.container.textContent).toContain('Cabañas')
    expect(view.container.querySelector('[role="alert"]')?.textContent)
      .toBe('La categoría tiene productos asociados y no puede eliminarse.')
  })
})
