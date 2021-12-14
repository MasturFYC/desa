const numberFormat = new Intl.NumberFormat("id-ID", {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const dateFormat = (month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined) => new Intl.DateTimeFormat("id-ID", {
  year: 'numeric',
  month: month,
  day: "2-digit"
});

export const FormatDate = (e: string, options: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined = 'short') => {
  return dateFormat(options).format(new Date(e));
}

export const FormatNumber = (e: number) => {
  return numberFormat.format(e);
}