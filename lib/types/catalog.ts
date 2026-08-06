export interface CatalogItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface NewCatalogItem {
  name: string;
}

export type CatalogKind = "departments" | "subjects";
