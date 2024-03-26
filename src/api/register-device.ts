import { fetch } from "@devicescript/net";
import { Settings } from "../services/singleton-setting";
import { JsonContentTypeHeader } from "./headers";

interface SymmetricKeyAuthentication {
    primaryKey: string,
    secondaryKey: string,
}

interface AuthenticationMechanism {
    symmetricKey: SymmetricKeyAuthentication
}

export interface RegisteredDeviceResponse {
    id: string,
    status: number,
    connectionState: number,
    authentication: AuthenticationMechanism,
}

export async function registerDevice(deviceId: string): Promise<RegisteredDeviceResponse> {
    const registerApiUrl = await Settings.readSetting('REG_API_URL');
    const key = await Settings.readSetting('REG_API_KEY');

    const bodyContent = JSON.stringify({ deviceId });
    console.debug("Register Device API request", bodyContent)

    const response = await fetch(registerApiUrl, {
        method: 'POST',
        headers: { ...JsonContentTypeHeader, 'x-functions-key': key },
        body: bodyContent
    });

    if (!response.ok) {
        throw new Error("An error ocurred while registering the device. Status: " + response.statusText)
    }

    const responseText = await response.text();
    await response.close();
    console.debug(responseText);

    return JSON.parse(responseText) as RegisteredDeviceResponse;
}