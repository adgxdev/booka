import { ValidationError } from "../packages/error-handler";

const emailRegex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const validateRegistrationData = (data: any, userType: "admin") => {
    const {name, email, phone_number} = data;

    if(!name || !email || (userType === "admin" && (!phone_number))){
        throw new ValidationError(`Missing Required Fields`)
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid Email Format")
    }
}