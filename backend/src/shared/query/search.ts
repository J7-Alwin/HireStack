export function buildSearchCondition(search?: string, fields: string[] = []): Record<string, unknown> | undefined {
  if (!search || fields.length === 0) {
    return undefined;
  }

  const cleanSearch = search.trim();
  if (cleanSearch === "") {
    return undefined;
  }

  const conditions = fields.map((field) => {
    // Handle nested fields (e.g. "company.name" -> { company: { name: { contains, mode } } })
    if (field.includes(".")) {
      const parts = field.split(".");
      const result: Record<string, unknown> = {};
      let current = result;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = { contains: cleanSearch, mode: "insensitive" };
        } else {
          const next: Record<string, unknown> = {};
          current[part] = next;
          current = next;
        }
      }
      return result;
    }

    return {
      [field]: {
        contains: cleanSearch,
        mode: "insensitive",
      },
    };
  });

  return { OR: conditions };
}
