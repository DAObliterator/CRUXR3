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
    axios.post(
      `${
        import.meta.env.VITE_ENV === "development"
          ? import.meta.env.VITE_API_DEV 
          : import.meta.env.VITE_API_PROD 
      }/auth/google/callback`,
      { withCredentials: true }
    ).then((response) => {
      console.log(response.data , "response.data from the /auth/google/callback endpoint")
    }).catch((error) => {
      console.log(`${error} --- error happened while sending post req to /auth/google/callback endpoint `)
    })
    
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
