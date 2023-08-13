import { Headers } from "@devicescript/net"

export type Param = { [k: string]: string }

export enum HttpMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Options = "OPTIONS",
    Head = "HEAD",
    Delete = "DELETE"
}

export const defaultHeaders = (): Headers => {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    return headers
}

export const clearHeaders = (headers: Headers): void => {
    let keys: string[] = []
    headers.forEach(key => keys.push(key))
    for (const k of keys) {
        headers.delete(k)
    }
}

export const asQueryParams = (obj: Param): string => {
    let params = []
    for (const key in obj) {
        params.push(`${key}=${obj[key]}`)
    }
    return params.join('&')
}