'use server';

import { registerUser } from '@/utils/password';
import { signIn, signOut } from '../auth';

export async function doLogout() {
    await signOut({ redirectTo: "/login" });
}

export async function doRegister(formData) {
    try{
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();
        const username = formData.get("name")?.toString();
        const response = await registerUser(email,password,username);
        return response;
    }catch(e) {
        throw e;
    }
}

export async function doCredentialLogin(formData) {
    try {
        const response = await signIn("credentials", {
            redirect: false,
            email: formData.get("email"),
            password:  formData.get("password"),
        });
        return response;
    }catch(e) {
        throw e;
    }
}