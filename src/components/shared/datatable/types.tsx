export type Column<T, TSort extends string = string> = {
  key: string
  title: string
  sortable?: boolean
  sortKey?: TSort;
  render?: (row: T) => React.ReactNode
  className?: string
  headerInfo?: React.ReactNode
}

export type Pagination = {
  currentPage: number
  totalPage: number
  size: number
}

export type FilterOption = {
  label: string
  value: string
}

export type SearchByOption = {
  label: string
  value: string
}

export type BaseFilterConfig = {
    key: string;
    label?: string;
};

export type SelectFilterConfig = BaseFilterConfig & {
    type?: "select";
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
};

export type SearchPairFilterConfig = BaseFilterConfig & {
    type: "searchPair";
    selectValue: string;
    selectOptions: FilterOption[];
    inputValue: string;
    inputPlaceholder?: string;
    onSelectChange: (value: string) => void;
    onInputChange: (value: string) => void;
};

export type DataTableFilterConfig =
    | SelectFilterConfig
    | SearchPairFilterConfig;