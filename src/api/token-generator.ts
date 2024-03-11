import { fetch } from "@devicescript/net"
import { readSetting } from "@devicescript/settings"

export interface TokenResponse {
    token: string,
    expiry: number
}

export async function getToken(uri: string, key: string, policyName: string = ""): Promise<TokenResponse> {
    const azureFuncApiKey = await readSetting("AZURE_FNC_KEY")
    const tokenApiUrl = await readSetting("SASTOKENAPI")

    const response = await fetch(`${tokenApiUrl}?apikey=${azureFuncApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Key: key, Uri: uri, PolicyName: policyName })
    })
    const tokenData = <TokenResponse>(await response.json())
    console.log(tokenData.token);

    await response.close()

    return tokenData
}