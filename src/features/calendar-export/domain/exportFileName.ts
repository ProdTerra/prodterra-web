export function exportFileName(calendarSlug: string, months: string[]): string {
  return `prodterra-${calendarSlug}-${months[0]}-${months[months.length - 1]}.pdf`;
}
