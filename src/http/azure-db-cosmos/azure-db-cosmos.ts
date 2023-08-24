import { digest, hmac } from "@devicescript/crypto";
import { Headers, Response, fetch } from "@devicescript/net";
import { Configuration } from "../../configuration";
import { IClock } from "../../interfaces/clock";
import { DateFormat } from "../../interfaces/date";
import { toDateBuffer } from "../../utils";
import { HttpMethod, defaultHeaders } from "../http";
import { encodeURIComponent } from "@devicescript/runtime";

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

    public async getMasterKeyAuthSignature(builder: SignatureBuilder): Promise<string> {
        const key = Configuration.get("AzureCosmosPrimaryKey");

        const { date, verb, resourceLink, resourceType } = builder
        console.log(date, verb, resourceLink, resourceType)
        const body = `${verb.toLowerCase()}\n${resourceType}\n${resourceLink}\n${date.toLowerCase()}\n\n`
        // const hash = digest("sha256", Buffer.from(key))

        const sha256Body = encodeURIComponent(body)
        const signature = hmac(key, "sha256", sha256Body).toString("hex")
        const authSet = encodeURIComponent(`type=master&ver=${this.tokenVersion}&sig=${signature}`);
        
        console.log("Request Date: ", date);
        console.log("AZ Cosmos DB Auth body: ", sha256Body)
        console.log("AZ Cosmos DB Auth signature: ", signature)
        console.log("AZ Cosmos DB Auth Set: ", authSet)
        
        return authSet
    }

    public async getDatabase(dbId: string): Promise<Response> {
        const date = await this.getRequestDate()
        const resourceType = "dbs"
        const resourceLink = `${resourceType}/${dbId}`
        const auth = await this.getMasterKeyAuthSignature({
            date,
            resourceType,
            resourceLink,
            verb: HttpMethod.Get,
        })

        const headers = this.getHeaders(auth, date)
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
