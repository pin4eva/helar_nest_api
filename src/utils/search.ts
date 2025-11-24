export const buildTsQuery = (input?: string): string => {
  if (!input) {
    return '';
  }

  const tokens = input
    .split(/\s+/)
    .map((token) =>
      token
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
        .trim(),
    )
    .filter(Boolean);

  if (!tokens.length) {
    return '';
  }

  return tokens.map((token) => `${token}:*`).join(' & ');
};
