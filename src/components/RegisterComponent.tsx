import { useMutation } from "@apollo/client/react";
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserContext } from '@/hooks/useUserContext';


const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $displayName: String!) {
    register(username: $username, password: $password, displayName: $displayName) {
      success
      message
      userId
      username
      displayName
      accessToken
    }
  }
`;


interface RegisterFormValues {
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  register: {
    success: boolean;
    message: string;
    userId?: string;
    username?: string;
    displayName?: string;
    accessToken?: string;
  };
}
const RegisterSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  displayName: Yup.string()
    .required("Display name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export function RegisterComponent() {
  const navigate = useNavigate();
  const { setLoginData } = useUserContext();
  const [register, { loading }] = useMutation<RegisterResponse>(REGISTER_MUTATION);

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      const res = await register({
        variables: {
          username: values.username,
          password: values.password,
          displayName: values.displayName,
        },
      });

      const registerData = res?.data?.register;

      if (!registerData?.success) {
        setFieldError("username", registerData?.message || "Registration failed");
        return;
      }
      setLoginData({
        userId: registerData.userId || "",
        username: registerData.username || "",
        displayName: registerData.displayName || "",
        accessToken: registerData.accessToken || "",
      });
      navigate("/");

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Registration failed";
      setFieldError("username", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <h3 className="font-bold mb-4 text-lg">Create Account</h3>

      <Formik
        initialValues={{
          username: "",
          displayName: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Field
                name="username"
                type="text"
                placeholder="Enter username"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.username && touched.username
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loading || isSubmitting}
              />
              {errors.username && touched.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <Field
                name="displayName"
                type="text"
                placeholder="Enter display name"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.displayName && touched.displayName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loading || isSubmitting}
              />
              {errors.displayName && touched.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Field
                name="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.password && touched.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loading || isSubmitting}
              />
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Field
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loading || isSubmitting}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Creating " : "Register"}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-sm text-blue-600 hover:underline"
              disabled={loading || isSubmitting}
            >
              Back to Login
            </button>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
