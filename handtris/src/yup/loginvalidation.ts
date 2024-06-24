import * as Yup from "yup";

const loginValidation = Yup.object({
    ID: Yup.string().required("ID is required"),
    password: Yup.string().required("Password is required"),
});

export default loginValidation;
