import { fetch } from "@devicescript/net";
import { Settings } from "../services/singleton-setting";
import { JsonContentTypeHeader } from "./headers";

export async function registerDevice(deviceId: string): Promise<void> {
    const registerApiUrl = await Settings.readSetting('REG_API_URL');
    const key = await Settings.readSetting('REG_API_KEY');
    
    const bodyContent = JSON.stringify({ deviceId });
    console.debug("Register Device API request", bodyContent)

    const response = await fetch(registerApiUrl, {
        method: 'POST',
        headers: { ...JsonContentTypeHeader, 'x-functions-key': key },
        body: bodyContent
    });

    console.debug(await response.text())

    if (!response.ok) {
        throw new Error("An error ocurred while registering the device. Status: " + response.statusText)
    }

    await response.close();
}