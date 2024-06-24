import * as Yup from "yup";

const registerValidation = Yup.object({
    ID: Yup.string()
        .required("아이디는 필수 입력 값입니다.")
        .min(4, "아이디는 최소 4자 이상이어야 합니다.")
        .max(10, "아이디는 10자 이하여야 합니다.")
        .matches(
            /^[a-z0-9]+$/,
            "아이디는 알파벳 소문자(a~z), 숫자(0~9)로 구성되어야 합니다."
        )
        .notOneOf(["admin"], "admin은 사용할 수 없습니다."),
    password: Yup.string()
        .required("비밀번호는 필수 입력 값입니다.")
        .min(8, "비밀번호는 8자 이상이어야 합니다.")
        .max(15, "비밀번호는 15자 이하여야 합니다.")
        .matches(
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/,
            "비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다."
        ),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "비밀번호가 일치하지 않습니다.")
        .required("비밀번호 확인은 필수 입력 값입니다."),
    nickname: Yup.string()
        .required("닉네임은 필수 입력 값입니다.")
        .min(4, "닉네임은 최소 4자 이상이어야 합니다.")
        .max(20, "닉네임은 20자 이하여야 합니다.")
        .matches(
            /^[a-zA-Z0-9]+$/,
            "닉네임은 알파벳 대소문자와 숫자만 사용 가능합니다."
        )
        .notOneOf(["admin"], "admin은 사용할 수 없습니다."),
});

export default registerValidation;
