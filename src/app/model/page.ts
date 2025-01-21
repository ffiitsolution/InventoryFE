export class Page {
  size: number = 0;
  totalElements: number = 0;
  totalPages: number = 0;
  pageNumber: number = 0;
  start: number = 0;
  length: number = 10;
  recordsTotal: number = 0;
  recordsFiltered: number = 0;
}

export class PageInfo {
    offset: number = 0;
    pageSize: number = 0;
    limit: number = 10;
    count: number = 0;
}


export interface Params {
    start: string;
    length: string;
    order?: string;
    search?: string;
    [key: string]: string | undefined;
  }