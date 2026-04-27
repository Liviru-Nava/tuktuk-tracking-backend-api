//Uses the JSON Collections pagination technique

export function getPaginationParams(query) {
  const limit  = Math.min(100, Math.max(1, parseInt(query.limit)  || 10));
  const offset = Math.max(0,               parseInt(query.offset) || 0);
  return { limit, offset };
}

export function buildCollection(href, offset, limit, total, items, filters = {}) {
  const totalPages  = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit);

  // Build query string from active filters (excludes offset and limit)
  function buildHref(newOffset) {
    const params = new URLSearchParams();
    // Add any active filter params first
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    });
    params.set('offset', newOffset);
    params.set('limit', limit);
    return `${href}?${params.toString()}`;
  }

  const firstOffset    = 0;
  const lastOffset     = Math.max(0, (totalPages - 1) * limit);
  const previousOffset = Math.max(0, offset - limit);
  const nextOffset     = offset + limit;

  return {
    href:     buildHref(offset),
    offset,
    limit,
    total,
    first:    buildHref(firstOffset),
    previous: offset > 0              ? buildHref(previousOffset) : null,
    next:     nextOffset < total      ? buildHref(nextOffset)     : null,
    last:     buildHref(lastOffset),
    count:    items.length,
    items,
  };
}