import { Response, fetch } from "@devicescript/net";
import { readSetting } from "@devicescript/settings";

export class FirebaseHttpClient {
    private apiKey: string
    private projectId: string;

    private readonly defaultHeaders = { "Content-Type": "application/json" }
    private readonly baseUrl = "https://firestore.googleapis.com"

    constructor(private readonly databaseId = "(default)") {
    }

    public async register() {
        this.projectId = await readSetting("FB_PROJID")
        this.apiKey = await readSetting("FB_APIKEY")
    }

    public async createDocument<T>(collectionId: string, data: T): Promise<Response> {
        // POST /v1/{parent=projects/*/databases/*/documents/**}/{collectionId}
        const url = `${this.baseUrl}/v1/projects/${this.projectId}/databases/${this.databaseId}/documents/${collectionId}?key=${this.apiKey}`
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { ...this.defaultHeaders }
        })
    }

    // delete	DELETE /v1/{name=projects/*/databases/*/documents/*/**}
    // Elimina un documento.
    // get	GET /v1/{name=projects/*/databases/*/documents/*/**}
    // Obtiene un solo documento.
    // list	GET /v1/{parent=projects/*/databases/*/documents/*/**}/{collectionId}
    // Lista documentos.
    // listCollectionIds	POST /v1/{parent=projects/*/databases/*/documents}:listCollectionIds
    // Enumera todos los ID de colección debajo de un documento.
    // listDocuments	GET /v1/{parent=projects/*/databases/*/documents}/{collectionId}
    // Lista documentos.
    // partitionQuery	POST /v1/{parent=projects/*/databases/*/documents}:partitionQuery
    // Particiona una consulta devolviendo cursores de partición que se pueden usar para ejecutar la consulta en paralelo.
    // patch	PATCH /v1/{document.name=projects/*/databases/*/documents/*/**}
    // Actualiza o inserta un documento.
    // rollback	POST /v1/{database=projects/*/databases/*}/documents:rollback
    // Revierte una transacción.
    // runQuery	POST /v1/{parent=projects/*/databases/*/documents}:runQuery
    // Ejecuta una consulta.
}