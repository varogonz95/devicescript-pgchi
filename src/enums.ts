import { Map } from "./utils";

export type ConfigKey =
    | "AppKey"
    | "Timezone"
    
    | "AdaUsername"
    | "AdaKey"

    | "FirestoreProjectId"
    | "FirestoreApiKey"

    | "AzureUri"
    | "AzureDbAccount"
    | "AzureCosmosPrimaryKey"
    | "AzureCosmosSecondaryKey"

    | "WifiSsid"
    | "WifiPwd"

    | "SoilPin"
    | "SoilMin"
    | "SoilMax"

    | "LightPin"
    | "LightMin"
    | "LightMax"

export const ConfigKeyMap: Map<string | ConfigKey, string> = {
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

    SoilPin: "SOIL_PIN",
    SoilMin: "SOIL_MIN",
    SoilMax: "SOIL_MAX",

    LightPin: "LIGHT_PIN",
    LightMin: "LIGHT_MIN",
    LightMax: "LIGHT_MAX",
}