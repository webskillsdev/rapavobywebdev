export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildShareSlug(title: string, id: string): string {
  return `${slugify(title)}-${id}`;
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractIdFromSlug(param: string): string {
  const match = param.match(UUID_REGEX);
  return match ? match[0] : param;
}