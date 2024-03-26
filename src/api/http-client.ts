import { Headers, Response, URL, fetch } from "@devicescript/net";
import { JsonContentTypeHeader } from "./headers";

export class HttpClient {

    public static async get(url: string | URL, queryParams?: Record<string, string>, headers?: Record<string, string> | Headers): Promise<Response> {
        const query = queryParams ?
            Object.keys(queryParams)
                .map(key => `${key}=${queryParams[key]}`)
                .join('&') : '';

        const _url = new URL(`${url}?${query}`)

        return await fetch(_url, {
            method: 'GET',
            headers: { ...headers }
        })
    }

    public static async post(url: string | URL, data: string | object | Buffer, headers?: Record<string, string> | Headers): Promise<Response> {
        return await fetch(url, {
            method: 'POST',
            headers: { ...JsonContentTypeHeader, ...headers },
            body: typeof (data) === "object" && !(data instanceof Buffer) ? JSON.stringify(data) : data,
        })
    }
}