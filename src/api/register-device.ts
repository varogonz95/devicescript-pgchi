import { fetch } from "@devicescript/net";
import { readSetting } from "@devicescript/settings";

export async function registerDevice(deviceId: string): Promise<void> {
    const registerApiUrl = await readSetting('REG_API_URL');
    const key = await readSetting('AZURE_FNC_KEY');
    const bodyContent = JSON.stringify({ deviceId });
    const response = await fetch(`${registerApiUrl}?apikey=${key}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json; charset=utf-8' },
        body: bodyContent
    });

    console.debug(await response.text())
}