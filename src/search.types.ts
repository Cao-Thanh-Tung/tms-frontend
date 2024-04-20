export interface Entity {
    [key: string]: string | number | boolean | undefined;
}
  
export interface SearchParams<T extends Entity> {
    criteria: T;
    keyword?: string;
}