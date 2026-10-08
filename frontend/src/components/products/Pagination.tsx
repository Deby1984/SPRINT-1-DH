type PaginationProps = {
  page: number
  total: number
  onPage: (page: number) => void
}

export function Pagination({ page, total, onPage }: PaginationProps) {
  return <div className="pagination"><button onClick={() => onPage(0)} disabled={page === 0}>« Inicio</button><button onClick={() => onPage(page - 1)} disabled={page === 0}>← Anterior</button><span>Página {page + 1} de {Math.max(total, 1)}</span><button onClick={() => onPage(page + 1)} disabled={page >= total - 1}>Siguiente →</button></div>
}
