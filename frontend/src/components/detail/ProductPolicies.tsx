import type { ProductPolicy } from '../../types'

export function ProductPolicies({ policies }: { policies: ProductPolicy[] }) {
  return <section className="product-policies" aria-labelledby="policies-title">
    <h2 id="policies-title">Qué tenés que saber</h2>
    <div className="policies-grid">
      {policies.map(policy => <article key={policy.title}>
        <h3>{policy.title}</h3>
        <p>{policy.description}</p>
      </article>)}
    </div>
  </section>
}
