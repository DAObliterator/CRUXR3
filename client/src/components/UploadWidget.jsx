import { useEffect, useRef } from "react";
import axios from "axios";

const UploadWidget = () => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;

    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dfjwrrpue",
        uploadPreset: "xseugjpb",
      },
      function (error, result) {
        try {
          console.log(result["info"]["files"][0]["uploadInfo"]["url"]);

          axios
            .post(
              `${
                import.meta.env.VITE_ENV === "development"
                  ? import.meta.env.VITE_API_DEV + "/imageUpload"
                  : import.meta.env.VITE_API_PROD + "/imageUpload"
              }`,
              { url: result["info"]["files"][0]["uploadInfo"]["url"] },
              { withCredentials: true }
            )
            .then((response) => {
              if (response.status === 200) {
                window.sessionStorage.removeItem("profilePic");
                window.sessionStorage.setItem(
                  "profilePic",
                  response.data.profilePic
                );
              }
            })
            .catch((error) => {
              console.log(
                `${error} --- error happened while updating Profile Picture`
              );
            });
        } catch (error) {
          console.log(`error happened - ${error} \n`);
        }
      }
    );
  }, []);

  return (
    <button
      style={{
        margin: "1rem",
        borderRadius: "1rem",
        color: "white",
        backgroundColor: "black",
      }}
      onClick={() => widgetRef.current.open()}
    >
      Edit Profile Picture
    </button>
  );
};

export default UploadWidget;
