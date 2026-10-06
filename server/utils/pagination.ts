export const getPagination = (
  pageValue: unknown,
  limitValue: unknown
) => {
  const page = Math.max( Number(pageValue) || 1, 1);
    const limit = Math.min( Math.max(Number(limitValue) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip, };
};
