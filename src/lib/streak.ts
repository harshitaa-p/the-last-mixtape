// A space's streak: how many days in a row someone in it added something.
// Days are the viewer's own calendar days. The streak stays alive through today, so it only
// breaks once a whole day has passed with nothing added.
const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()

export function spaceStreak(dates: string[], now = new Date()): { days: number; doneToday: boolean } {
  // A post dated after "now" means this device's clock is behind; count it as today.
  const posted = new Set(dates.map((d) => dayKey(new Date(Math.min(new Date(d).getTime(), now.getTime())))))
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const doneToday = posted.has(dayKey(day))
  if (!doneToday) day.setDate(day.getDate() - 1) // today isn't over yet, start from yesterday
  let days = 0
  while (posted.has(dayKey(day))) {
    days++
    day.setDate(day.getDate() - 1)
  }
  return { days, doneToday }
}
