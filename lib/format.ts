const numberFormat = new Intl.NumberFormat("id-ID", {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  year: "numeric",
  month: "long",
  day: "2-digit"
});

export const FormatDate = (e: string) => {
  return dateFormat.format(new Date(e));
}

export const FormatNumber = (e: number) => {
  return numberFormat.format(e);
}