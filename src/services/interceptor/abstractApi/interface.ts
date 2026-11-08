export interface INetworkResponse<D, I = string> {
  code: string;
  data: D;
  detail: I;
}

export interface IPaginationMeta {
  page_count: number;
  total_count: number;
}

export interface IPaginatedResponse<D> {
  items: D[];
  meta: IPaginationMeta;
}
