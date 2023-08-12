import { Response, Socket, connect, fetch } from "@devicescript/net";
import { readSetting } from "@devicescript/settings";
import { SignInWithCustomTokenResponse, SignInWithPasswordResponse } from "./firebase/responses";

interface AuthHeader {
    ["x-api-key"]: string
    Authorization: string
}

export class FirebaseHttpClient {
    private apiKey: string
    private projectId: string;

    private authHeaders: AuthHeader
    private readonly defaultHeaders = { "Content-Type": "application/json" }
    private readonly host = "firestore.googleapis.com"
    private readonly authHost = "identitytoolkit.googleapis.com"
    private readonly baseUrl = `https://${this.host}`

    constructor(private readonly databaseId = "(default)") {
    }

    public async register(token: string | Buffer) {
        this.projectId = await readSetting("FB_PROJID")
        this.apiKey = await readSetting("FB_APIKEY")

        // const { idToken } = await this.signInWithToken(token)
        // this.authHeaders = {
        //     Authorization: `Bearer ${idToken}`
        // }
    }

    public async createDocument<T>(collectionId: string, data: T): Promise<Response> {
        // POST /v1/{parent=projects/*/databases/*/documents/**}/{collectionId}
        const url = `${this.baseUrl}/v1/projects/${this.projectId}/databases/${this.databaseId}/documents/${collectionId}`
        const options = {
            method: "POST",
            body: "{}",
            headers: { "Content-Type": "application/json", key: this.apiKey }
        }
        console.log("POST: ", url)
        console.log("REQUEST OPTIONS: ", options)
        return await fetch(url, options)
    }

    public async signInWithToken(token: string | Buffer): Promise<SignInWithCustomTokenResponse> {
        const url = `https://${this.authHost}/v1/accounts:signInWithCustomToken?key=${this.apiKey}`
        const { ok, json } = await fetch(url, {
            method: "POST",
            headers: { ...this.defaultHeaders },
            body: JSON.stringify({
                token,
                returnSecureToken: true,
            })
        })

        if (ok) {
            return await json() as SignInWithCustomTokenResponse
        }

        throw new Error("Failed to exchange custom token.")
    }

    public async signInWithPassword(email: string, password: string): Promise<SignInWithPasswordResponse> {
        const endpoint = `/v1/accounts:signInWithPassword?key=${this.apiKey}`

        const socket = await connect({
            host: this.authHost,
            port: 443,
            proto: "tls",
            timeout: 120,
        })
        await socket.send(`POST ${endpoint} HTTP/1.1

        Accept: application/json
        Content-Type: application/json
        
        {
          "email": "${email}",
          "password: "${password}"
        }`)

        const response = await socket.readLine()
        return JSON.parse(response)
        // const { ok, json } = await fetch(url, {
        //     method: "POST",
        //     headers: { ...this.defaultHeaders },
        //     body: JSON.stringify({
        //         email, password,
        //         returnSecureToken: true,
        //     })
        // })

        // if (ok) {
        //     return await json()
        // }

        // throw new Error("Failed to exchange custom token.")
    }
}