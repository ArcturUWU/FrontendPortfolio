const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
})

const yearFormatter = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
})

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function formatMonthYear(value: string): string {
  return monthYearFormatter.format(new Date(value))
}

export function formatDateMetric(value: string): { dayMonth: string; year: string } {
  const date = new Date(value)

  return {
    dayMonth: dayMonthFormatter.format(date),
    year: `${yearFormatter.format(date)} г.`,
  }
}
