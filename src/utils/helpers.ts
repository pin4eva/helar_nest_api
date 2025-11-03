export const parseExpiry = (expiry: string): number => {
  const unit = expiry.slice(-1);
  const value = Number(expiry.slice(0, -1));

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid expiry format: ${expiry}`);
  }
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export const ISOStringDate = (date: string | Date) => {
  return new Date(date)?.toISOString()?.substring(0, 10);
};
