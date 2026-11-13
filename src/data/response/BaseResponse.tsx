export type BaseResponse<T> = {
    pagging: { currentPage: number; totalPage: number; size: number } | undefined;
    status: number;
    data?: T;
    errors?: string;
    message?: string;
    trxId?: string;
};

export type Pagination = {
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    status: number;
    data?: T;
    pagination?: Pagination;
    errors?: string;
    message?: string;
    trxId?: string;
};
