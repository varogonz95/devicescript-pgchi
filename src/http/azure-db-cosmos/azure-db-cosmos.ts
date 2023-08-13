import { digest, hmac } from "@devicescript/crypto";
import { Headers, Response, fetch } from "@devicescript/net";
import { HttpMethod } from "../http";

export type ResourceType = "dbs" | "colls" | "sprocs" | "udfs" | "triggers" | "users" | "permissions" | "docs"
export type AzureKeyType = "master" | "resource" | "aad"

export interface SignatureBuilder {
    verb: HttpMethod,
    resourceType: ResourceType,
    resourceLink: string,
    date: string,
    key: string
    keyType: AzureKeyType
}

export class AzureDbCosmosClient {
    private readonly tokenVersion = "1.0";
    private readonly defaultHeaders = new Headers()

    constructor() {
    }

    public async register(): Promise<void> { }

    public getMasterKeyAuthSignature(builder: SignatureBuilder): Buffer {
        const {verb, date, key, resourceLink, resourceType, keyType} = builder
        const payload = Buffer.from(`${verb.toLowerCase()}\n${resourceType.toLowerCase()}\n${resourceLink}\n${date.toLowerCase()}\n\n`, "hex")
        const hash = digest("sha256", Buffer.from(key, "hex"))
        const signature = hmac(hash, "sha256", payload).toString("hex")

        const authSet = Buffer.from(`type=${keyType}&ver=${this.tokenVersion}&sig=${signature}`)
        console.log("AZ Cosmos DB Auth Key signature: ", signature)
        console.log("AZ Cosmos DB Auth Set: ", authSet)
        return authSet
    }

    public async getCollections(dbId: string): Promise<Response> {
        const response = fetch(, {})
    }

    private setDefaultHeaders(auth: string, date: string): void {
        this.clearDefaultHeaders()
        this.defaultHeaders.set("Accept", "application/json")
        this.defaultHeaders.set("authorization", auth)
        this.defaultHeaders.set("x-ms-date", date)
        this.defaultHeaders.set("x-ms-version", "2018-12-31")
    }

    private clearDefaultHeaders(): void {
        let keys: string[] = []
        this.defaultHeaders.forEach(key => keys.push(key))
        for (const k of keys) {
            this.defaultHeaders.delete(k)
        }
    }
}
