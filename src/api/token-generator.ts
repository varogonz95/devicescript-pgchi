import { fetch } from "@devicescript/net"
import { readSetting } from "@devicescript/settings"

export interface TokenResponse {
    token: string,
    expiry: number
}

export async function getToken(uri: string, key: string, policyName: string = ""): Promise<TokenResponse> {
    const azureFuncApiKey = await readSetting("AZURE_FNC_KEY")
    const tokenApiUrl = await readSetting("SASTOKENAPI")
    const requestBody = JSON.stringify({ Key: key, Uri: uri, PolicyName: policyName })

    console.debug("SAS Token API request", requestBody)

    const response = await fetch(`${tokenApiUrl}?apikey=${azureFuncApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: requestBody
    })
    
    console.debug("SAS Token API response", await response.text());
    
    const tokenData = <TokenResponse>(await response.json())
    await response.close()

    return tokenData
}