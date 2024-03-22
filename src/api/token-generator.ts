import { fetch } from "@devicescript/net"
import { Settings } from "../services/singleton-setting"
import { JsonContentTypeHeader } from "./headers";

export interface TokenResponse {
    token: string,
    expiry: number
}

export async function getToken(uri: string, key: string, policyName: string = ""): Promise<TokenResponse> {
    const tokenApiUrl = await Settings.readSetting("TOKEN_API_URL");
    const funcKey = await Settings.readSetting("TOKEN_API_KEY");
    
    const requestBody = JSON.stringify({ Key: key, Uri: uri, PolicyName: policyName });
    console.debug("SAS Token API request", requestBody)

    const response = await fetch(tokenApiUrl, {
        method: "POST",
        headers: { ...JsonContentTypeHeader, 'x-functions-key': funcKey },
        body: requestBody
    });

    if (!response.ok) {
        throw new Error("An error occured retrieving the token. Status: " + response.statusText)
    }

    const textResponse = await response.text();
    await response.close();
    console.debug("SAS Token API response", textResponse);

    const tokenData = <TokenResponse>(JSON.parse(textResponse));
    
    return tokenData;
}