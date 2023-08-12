export interface SignInWithCustomTokenResponse {
    idToken: string
    refreshToken: string
    expiresIn: string
}

export interface SignInWithPasswordResponse {
    idToken: string
    email: string
    refreshToken: string
    expiresIn: string
    localId: string
    registered: boolean
}