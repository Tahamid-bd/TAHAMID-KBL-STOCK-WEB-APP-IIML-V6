// Utility for sorting table datasets dynamically
export function sortData<T>(items: T[], sortKey: string, sortDir: 'asc' | 'desc'): T[] {
  if (!sortKey) return items;

  return [...items].sort((a: any, b: any) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    // Check if numeric
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    const bothNumeric = !isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean' && aVal !== '' && bVal !== '';

    if (bothNumeric) {
      return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Date comparison if string format matches YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (typeof aVal === 'string' && typeof bVal === 'string' && dateRegex.test(aVal) && dateRegex.test(bVal)) {
      const aDate = new Date(aVal).getTime();
      const bDate = new Date(bVal).getTime();
      return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // String comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}
