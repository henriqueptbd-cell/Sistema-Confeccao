export const hoje = () => new Date().toISOString().slice(0, 10)
export const mesAtual = () => new Date().getMonth() + 1
export const anoAtual = () => new Date().getFullYear()

export const formatarData = (data) => {
  if (!data) return '—'
  try {
    if (typeof data === 'string' && !data.includes('T')) {
      const [year, month, day] = data.split('-')
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
    }
    return new Date(data).toLocaleDateString('pt-BR')
  } catch (e) {
    return '—'
  }
}
