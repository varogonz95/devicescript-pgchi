import { digest, hmac } from "@devicescript/crypto";
import { Headers, Response, fetch } from "@devicescript/net";
import { Configuration } from "../../configuration";
import { IClock } from "../../interfaces/clock";
import { DateFormat } from "../../interfaces/date";
import { toDateBuffer } from "../../utils";
import { HttpMethod, defaultHeaders } from "../http";

export type ResourceType = "dbs" | "colls" | "sprocs" | "udfs" | "triggers" | "users" | "permissions" | "docs"
export type AzureKeyType = "master" | "resource" | "aad"

export interface SignatureBuilder {
    date: string,
    verb: HttpMethod,
    resourceType: ResourceType,
    resourceLink: string,
}

export class AzureDbCosmosClient {
    private readonly tokenVersion = "1.0";

    constructor(
        private readonly uri: string,
        private readonly clockService: IClock) {
    }

    public async register(): Promise<void> { }

    public async getMasterKeyAuthSignature(builder: SignatureBuilder): Promise<Buffer> {
        const key = Configuration.get("AzureCosmosPrimaryKey");

        const { date, verb, resourceLink, resourceType } = builder
        const payload = Buffer.from(`${verb}\n${resourceType}\n${resourceLink}\n${date}\n\n`, "hex")
        const hash = digest("sha256", Buffer.from(key, "hex"))
        const signature = hmac(hash, "sha256", payload).toString("hex")
        const authSet = Buffer.from(`type=master&ver=${this.tokenVersion}&sig=${signature}`)

        console.log("Request Date: ", date);
        console.log("AZ Cosmos DB Auth Key signature: ", signature)
        console.log("AZ Cosmos DB Auth Set: ", authSet)

        return authSet
    }

    public async getCollections(dbId: string): Promise<Response> {
        const date = await this.getRequestDate()
        const resourceType = "dbs"
        const resourceLink = `${resourceType}/${dbId}/colls`
        const auth = await this.getMasterKeyAuthSignature({
            date,
            resourceType,
            resourceLink,
            verb: HttpMethod.Get,
        })

        const headers = this.getHeaders(auth.toString(), date)
        return await fetch(this.uri + resourceLink, {
            headers,
            method: HttpMethod.Get,
        })
    }

    private async getRequestDate(): Promise<string> {
        const dateParts = await this.clockService.now()
        console.log("Date parts: ", dateParts);
        const timezone = Configuration.get("Timezone");
        return toDateBuffer(dateParts, timezone, DateFormat.RFC1123).toString()
    }

    private getHeaders(auth: string, date: string): Headers {
        const headers = defaultHeaders()
        headers.set("Accept", "application/json")
        headers.set("authorization", auth)
        headers.set("x-ms-date", date)
        headers.set("x-ms-version", "2018-12-31")
        return headers
    } 
}
