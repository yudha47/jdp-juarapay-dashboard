export type CategoryModel = {
    catUid: string;
    catDesc: string;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
};

export type CategorySort = "createdAt" | "catDesc";
export type CategoryOrder = "asc" | "desc";
export type GetCategoryParams = {
    page: number;
    limit: number;
    sort: CategorySort;
    order: CategoryOrder;
    q?: string;
};
