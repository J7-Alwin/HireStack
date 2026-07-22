export function buildSearchCondition(search?: string, fields: string[] = []): Record<string, any> | undefined {
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
      let current: Record<string, any> = {};
      const result = current;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = { contains: cleanSearch, mode: "insensitive" };
        } else {
          current[part] = {};
          current = current[part];
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
