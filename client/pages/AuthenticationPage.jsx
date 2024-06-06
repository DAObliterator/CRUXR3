import React from "react";
import "./AuthenticationPage.css";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

export const AuthenticationPage = () => {
  return (
    <div id="Authentication-Main">
      <LoginComponent></LoginComponent>
    </div>
  );
};

const LoginComponent = () => {
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const response = await axios.post(
      `${
        import.meta.env.VITE_ENV === "development"
          ? import.meta.env.VITE_API_DEV 
          : import.meta.env.VITE_API_PROD 
      }/google/auth/callback`,
      { withCredentials: true }
    );
    console.log(response.data , ` response.data from /google/auth/callback \n`)
  };


  return (
    <div id="Login-Main">
      <form action="" id="Login-Form" onSubmit={(ev) => handleSubmit(ev)}>
        <h2 id="Login-Heading">LOGIN</h2>
        <button
          id="Google-Btn"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "red",
          }}
          type="submit"
        >
          Sign In With Google
          <FaGoogle
            style={{
              fontSize: "1.5rem",
              letterSpacing: "2px",
              color: "white",
              marginLeft: "2px",
            }}
          ></FaGoogle>
        </button>
      </form>
    </div>
  );
};
