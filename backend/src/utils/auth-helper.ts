import { ValidationError } from "../packages/error-handler";

const emailRegex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const validateRegistrationData = (data: any, userType: "admin") => {
    const { name, email } = data;

    // For admin registration, we currently only require name and email.
    // Password is generated server-side, and phone_number/university are not stored in the schema yet.
    if (!name || !email) {
        throw new ValidationError(`Missing Required Fields`);
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid Email Format");
    }
}