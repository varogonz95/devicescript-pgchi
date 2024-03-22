import { startMQTTClient } from "@devicescript/net";
import { Settings } from "../services/singleton-setting";
import { getToken } from "./token-generator";

export async function connectToIoTHub(clientId: string) {
    const host = await Settings.readSetting('AZURE_IOT_HST');
    const port = parseInt(await Settings.readSetting('AZURE_IOT_PRT'));

    const username = `${host}/${clientId}/?api-version=2021-04-12`;
    const uri = host + "/devices/" + clientId;
    const key = await Settings.readSetting('AZURE_IOT_KEY');
    const { token: password } = await getToken(uri, key);

    return await startMQTTClient({
        host,
        port,
        username,
        password,
        clientId,
    });
}