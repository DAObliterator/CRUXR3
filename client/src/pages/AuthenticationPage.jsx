import React from "react";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

export const AuthenticationPage = () => {
  return (
    <div
      id="Authentication-Main"
      className=" min-h-screen flex items-center justify-center w-screen"
    >
      <LoginComponent />
    </div>
  );
};

const LoginComponent = () => {
  return (
    <div
      id="Login-Main"
      className="bg-gray-700 p-8 rounded-lg shadow-lg flex flex-col items-center w-80"
    >
      <form
        id="Login-Form"
        className="flex flex-col items-center w-full space-y-6"
      >
        <h2 id="Login-Heading" className="text-2xl text-white font-semibold">
          LOGIN
        </h2>

        <button
          id="Google-Btn"
          className="btn-primary"
          type="button"
        >
          <a
            href={
              import.meta.env.VITE_ENV === "development"
                ? import.meta.env.VITE_API_DEV + "/auth/google"
                : import.meta.env.VITE_API_PROD + "/auth/google"
            }
            className="flex items-center space-x-2 text-white"
          >
            <span>Sign In With Google</span>
            <FaGoogle className="text-white text-lg" />
          </a>
        </button>
      </form>
    </div>
  );
};
