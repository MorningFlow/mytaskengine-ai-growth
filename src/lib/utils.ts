export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}
