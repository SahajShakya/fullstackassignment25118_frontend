import { useMutation } from "@apollo/client/react";
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserContext } from '@/hooks/useUserContext';


const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      message
      userId
      username
      displayName
      accessToken
    }
  }
`;

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    userId: string;
    username: string;
    displayName: string;
    accessToken: string;
  };
}

export const LoginSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});


export function LoginComponent() {
  const navigate = useNavigate();
  const { userId, userName, setLoginData } = useUserContext();
  const [login, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setErrors }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      const res = await login({
        variables: {
          username: values.username,
          password: values.password,
        },
      });

      const loginData = res?.data?.login;

      if (!loginData?.success) {
        setErrors({ username: loginData?.message || "Login failed" });
        setSubmitting(false);
        return;
      }

      setLoginData({
        userId: loginData.userId,
        username: loginData.username,
        displayName: loginData.displayName,
        accessToken: loginData.accessToken,
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setErrors({ username: errorMessage });
      setSubmitting(false);
    }
  };

  if (userId) {
    return (
      <Card className="p-4 max-w-md mx-auto mt-10">
        <h3 className="font-bold">Welcome, {userName}!</h3>
        <p className="text-sm text-gray-600">You can now enter a store</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <h3 className="font-bold mb-4 text-lg">Login</h3>

      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Password</label>
              <Field
                name="password"
                type="password"
                placeholder="Enter password"
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

  
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Logging in..." : "Login"}
            </Button>


            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full text-sm text-blue-600 hover:underline"
              disabled={loading || isSubmitting}
            >
              Don't have account? Register
            </button>
          </Form>
        )}
      </Formik>
    </Card>
  );
}
