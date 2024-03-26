import { startMQTTClient } from "@devicescript/net";
import { Settings } from "../services/singleton-setting";
import { getToken } from "./token-generator";

export async function connectToIotHub(clientId: string, key: string) {
    const host = await Settings.readSetting('AZURE_IOT_HST');
    const port = parseInt(await Settings.readSetting('AZURE_IOT_PRT'));

    const username = `${host}/${clientId}/?api-version=2021-04-12`;
    const uri = host + "/devices/" + clientId;
    const { token: password } = await getToken(uri, key);

    console.debug("Starting MQTT client:")
    console.debug("host: ", host);
    console.debug("port: ", port);
    console.debug("username: ", username);
    console.debug("password: ", password);
    console.debug("clientId: ", clientId);

    return await startMQTTClient({
        host,
        port,
        username,
        password,
        clientId,
    });
}