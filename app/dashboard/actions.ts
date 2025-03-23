'use server'

import { verifySession } from "../_lib/sessions";

export async function onLoad() {
    // console.log((await verifySession()).isAuth);
    return { isAuth: (await verifySession()).isAuth };
}