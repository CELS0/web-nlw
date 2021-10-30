import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type AutheResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
    user: User | null;
    signInUrl: string;
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
    children: ReactNode;
}

export function AuthProvider(props: AuthProvider) {
    const signInUrl = 'https://github.com/login/oauth/authorize?scope=user&client_id=473ca6385c1f1ae4800b';
    const [user, setUser] = useState<User | null>(null)

   
    async function signIn(githubCode: string) {
        const response = await api.post<AutheResponse>('/authenticate', {
            code: githubCode,
        })

        const { token, user } = response.data;

        localStorage.setItem('@dowhile:token', token)

        setUser(user)
    }

    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');

        if (hasGithubCode) {
            const [urlWithGithubCode, githubCode] = url.split('?code=')

            window.history.pushState({}, '', urlWithGithubCode)

            signIn(githubCode)
        }
    })

    return (
        <AuthContext.Provider value={{ signInUrl, user }}>
            {props.children}
        </AuthContext.Provider>
    )
}