export interface IConfiguration {
    get<T = any>(section: string, defaultValue?: number): Promise<T>;
    set<T = any>(section: string, value: T): Promise<void>;

}