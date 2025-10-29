export const sortArrayByDateThenAlphabetically = (
  array: any[],
  time_key: string,
  title_key = "name"
) => {
  if (!array.length) return [];
  return array.sort((a, b) => {
    const dateA = new Date(a[time_key].split(/[T ]/)[0]);
    const dateB = new Date(b[time_key].split(/[T ]/)[0]);

    // First, sort by date
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // If dates are the same, sort by name alphabetically
    return (a[title_key] as string).localeCompare(b[title_key]);
  });
};
