'use server'

import { PrismaClient } from '@prisma/client';
import {
    FormState,
    SignupFormSchema,
} from '@/app/_lib/definitions';
import bcrypt from "bcryptjs"

const prisma = new PrismaClient();

export async function signup(state: FormState, formData: FormData,): Promise<FormState> {
    //Validate fields
    const formValues = {
        firstname: formData.get("firstname")?.toString() || "",
        lastname: formData.get("lastname")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        key: formData.get("key")?.toString() || "",
    };

    const validatedFields = SignupFormSchema.safeParse(formValues);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors, // Return errors if errors
            values: formValues, // Persist values in the state
        }
    }
    if (formValues.key != "241223") {
        return {
            errors: { key: ["Invalid Access Key"] }
        }
    }

    const { firstname, lastname, email, password, key } = validatedFields.data

    //Create user
    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // Hash user password

        // Save user to the database
        const newUser = await prisma.admins.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPassword,
            },
        });


        return {
            errors: {},
            values: {
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                key: "",
            },
            message: "success",
        }; // Clear form on success
    } catch (error: any) {
        if (error.code === "P2002") {
            return {
                errors: { email: ["This email is already in use."] },
                values: formValues,
            };
        }
        console.error("Database error:", error);
        return { errors: {}, values: formValues, message: "Something went wrong." };
    }


}