
export const formatCurrency = (amount: number) => {
  return (amount / 1).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
  });
};

export const formatDateToLocal = (
  dateStr: string | null,
  locale: string = 'es-CO'
) => {
  if (!dateStr) {
    return ''; 
  }
  const date = new Date(dateStr);
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(utcDate);
};



export const generatePagination = (currentPage: number, totalPages: number) => {

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

 
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
export const hotelMapping: { [key: string]: string } = {
  '1': 'Heron I',
  '2': 'Heron II'
};
