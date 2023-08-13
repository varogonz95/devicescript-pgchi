import { Map } from "./utils";

export const ConfigKeyMap: Map<string, string> = {
    AppKey: "APP_KEY",
    Timezone: "TIMEZONE",

    AdaUsername: "AIO_USERNAME",
    AdaKey: "AIO_KEY",

    FirestoreProjectId: "FB_PROJID",
    FirestoreApiKey: "FB_APIKEY",

    AzureUri: "AZ_URI",
    AzureDbAccount: "AZ_DB_ACCT",
    AzureCosmosPrimaryKey: "AZ_COSMOS_PK",
    AzureCosmosSecondaryKey: "AZ_COSMOS_SK",

    WifiSsid: "WIFI_SSID",
    WifiPwd: "WIFI_PWD",

    SoilMin: "SOIL_MIN",
    SoilMax: "SOIL_MAX",

    LightMin: "LIGHT_MIN",
    LightMax: "LIGHT_MAX",
}