/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { renderReact } from '../../test/reactTestUtils'
import { ProductPolicies } from './ProductPolicies'

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

describe('ProductPolicies', () => {
  it('presenta cada política con título y descripción dentro del bloque identificado', async () => {
    const policies = [
      { title: 'Normas de la casa', description: 'No fumar dentro del alojamiento.' },
      { title: 'Salud y seguridad', description: 'Seguí las indicaciones del anfitrión.' },
      { title: 'Política de cancelación', description: 'Cancelación gratuita hasta 48 horas antes.' },
    ]
    const view = await renderReact(<ProductPolicies policies={policies} />)
    cleanups.push(view.cleanup)

    const section = view.container.querySelector('section.product-policies')
    expect(section?.getAttribute('aria-labelledby')).toBe('policies-title')
    expect(section?.querySelector('#policies-title')?.textContent).toBe('Qué tenés que saber')
    expect(section?.querySelectorAll('article')).toHaveLength(3)

    const rendered = [...section!.querySelectorAll('article')].map(article => ({
      title: article.querySelector('h3')?.textContent,
      description: article.querySelector('p')?.textContent,
    }))
    expect(rendered).toEqual(policies.map(policy => ({
      title: policy.title,
      description: policy.description,
    })))
  })
})
