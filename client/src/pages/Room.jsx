import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/socketContext";
import { IoExit } from "react-icons/io5";
import { UsersInPodcastContext } from "../context/usersInPodcast";
import { Peer } from "peerjs";

export const Room = () => {
  const { roomname } = useParams();
  const socket = useContext(SocketContext);
  const [hostInfo, setHostInfo] = useState({});
  const [message, setMessage] = useState("");
  const [viewers, setViewers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const hostAudio = useRef(new MediaStream());
  const roomID = roomname;
  const yourName = window.sessionStorage.getItem("name");

  const isHost =
    window.sessionStorage.getItem("podcastTopic") !== null &&
    window.sessionStorage.getItem(
      window.sessionStorage.getItem("podcastTopic")
    ) === roomname;
  const { podcastListeners, setPodcastListeners } = useContext(
    UsersInPodcastContext
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    if (isHost) {
      console.log(`host at ${roomID}`);

      setHostInfo({
        hostName: window.sessionStorage.getItem("name"),
        hostProfilePhoto: window.sessionStorage.getItem("profilePic"),
      });

      socket.emit("room-created", {
        hostName: window.sessionStorage.getItem("name"),
        roomID: roomID,
        podcastTopic: window.sessionStorage.getItem("podcastTopic"),
        hostProfilePic: window.sessionStorage.getItem("profilePic"),
      });

      const hostPeer = new Peer(window.sessionStorage.getItem("name"), {
        host:
          import.meta.env.VITE_ENV === "development"
            ? "localhost"
            : "sermobackend.onrender.com",
        port: 6006,
        path: "/peerjs",
      });

      socket.on("new listener", (data) => {
        console.log(`new listener just joined -- ${JSON.stringify(data)}`);

        let userToSignal = data.userToSignal;

        //new person has joined show components so that host can give permission to speak
        setViewers((prevViewers) => {
          const viewerExists = prevViewers.some(
            (viewer) => viewer.name === data.userToSignalInfo.name
          );
          if (!viewerExists) {
            return [...prevViewers, data.userToSignalInfo];
          }
          return prevViewers;
        });

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            hostAudio.current.srcObject = stream;

            hostPeer.on("open", (id) => {
              console.log(id, "hostPeer connection id ");
            });
            console.log(`audio intended for ${data.userToSignalInfo.name}`);
            const call = hostPeer.call(data.userToSignalInfo.name, stream);
            call.on("error", (err) => {
              console.error("Call error:", err);
            });
          })
          .catch((error) => {
            console.log(`error accessing media devices ${error}`);
          });
      });
    } else {
      //you are a listener not a host
      console.log(`listener on ${roomID}`);

      socket.emit("join-room", {
        name: window.sessionStorage.getItem("name"),
        profilePhoto: window.sessionStorage.getItem("profilePic"),
        roomID,
      });

      const listenerPeer = new Peer(window.sessionStorage.getItem("name"), {
        host:
          import.meta.env.VITE_ENV === "development"
            ? "localhost"
            : "sermobackend.onrender.com",
        port: 6006,
        path: "/peerjs",
      });

      listenerPeer.on("open", (id) => {
        console.log(`${id} of listener `);
      });

      listenerPeer.on(
        "call",
        (call) => {
          console.log(call, "call in listener");

          call.on("stream", (stream) => {
            console.log(` Stream received: ${stream}`);
            hostAudio.current.srcObject = stream;
          });

          call.on("error", (err) => {
            console.error("Call error:", err);
          });
        },
        (error) => {
          console.log(`${error} - happened when listening to call `);
        }
      );

      socket.on("new listener", (data) => {
        console.log(`${JSON.stringify(data.usersInRoom)} all usersInRoom`);

        if (data.usersInRoom.length > 0) {
          let temp = {};
          let listenersArray = [];
          data.usersInRoom.forEach((item) => {
            if (item.host === true) {
              temp = item;
            }
          });

          listenersArray = data.usersInRoom.filter((item) => {
            if (item.host === false) {
              return item;
            }
          });

          let uniqueItems = new Set();
          let index = 0;

          while (index < listenersArray.length) {
            if (uniqueItems.has(listenersArray[index])) {
              listenersArray.splice(index, 1); // Remove duplicate
            } else {
              uniqueItems.add(listenersArray[index]);
              index++;
            }
          }

          console.log(
            listenersArray,
            "listenersArray after removing duplicates \n"
          );

          setViewers(listenersArray);

          setHostInfo({
            hostName: temp.name,
            hostProfilePhoto: temp.profilePhoto,
          });
        }
      });
    }

    socket.on("receive message", (data) => {
      console.log(` message received ${JSON.stringify(data)} \n  `);
      setAllMessages((prevAllMessages) => [...prevAllMessages, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("new-listener");
    };
  }, [socket]);

  const sendMessage = (ev) => {
    ev.preventDefault();

    if (message === "") {
      alert("Message input field is empty!!!");
    } else {
      socket.emit("send message", { roomID, message });
      setMessage("");
    }
  };

 return (
   <div
     id="Room-Main"
     className="w-screen min-h-screen flex flex-col justify-evenly items-center pt-10  text-white" // Set a consistent background and text color
   >
     {/* Podcast Topic Heading */}
     <h1 className="m-4 text-2xl font-semibold text-center">
       {window.sessionStorage.getItem("podcastTopic")}
     </h1>

     {/* Room Card Container */}
     <div
       id="Room-Card"
       className="rounded-lg flex flex-col justify-evenly items-center p-4 bg-gray-800 w-11/12 max-w-3xl shadow-lg"
     >
       {/* Speakers Section */}
       <div id="Speakers-Main" className="flex flex-col w-full mb-4">
         <h4 className="text-lg font-bold mb-2 text-center">SPEAKERS</h4>
         {Object.keys(hostInfo).length > 0 ? (
           <div
             id="Host-Card-Main"
             key={hostInfo.hostName}
             className="flex flex-col justify-center items-center border-2 border-red-600 rounded-lg p-4 bg-gray-700"
           >
             <div
               id="Host-Card"
               className="flex flex-col justify-center items-center p-4 bg-gray-600 rounded-md shadow-md w-full"
             >
               <img
                 id="Host-Profile-Pic"
                 src={hostInfo.hostProfilePhoto}
                 className="rounded-full h-20 w-20 mb-2"
                 alt="Host Profile"
               />
               <div id="Host-Name" className="text-lg font-medium">
                 {hostInfo.hostName}
               </div>
             </div>
             <button className="btn-primary mt-4 bg-red-700 hover:bg-red-800 text-white rounded-md py-2 px-4">
               END SESSION
             </button>
           </div>
         ) : (
           <div className="text-center text-gray-400">
             No host currently available
           </div>
         )}
         <audio ref={hostAudio} autoPlay></audio>
       </div>

       <div id="Breaker" className="w-full h-px bg-gray-600 my-4"></div>

       {/* Viewers Section */}
       <div
         id="Viewers-Main"
         className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full"
       >
         {Array.isArray(viewers) ? (
           viewers.map((viewer) => (
             <div
               id="Viewer-Card-Main"
               key={viewer.name}
               className="bg-gray-700 p-4 flex flex-col justify-center items-center rounded-lg shadow-md"
             >
               <img
                 id="Viewer-Profile-Pic"
                 src={viewer.profilePhoto}
                 className="h-16 w-16 rounded-full mb-2"
                 alt="Viewer Profile"
               />
               <div id="Viewer-Name" className="text-center font-medium">
                 {viewer.name}
               </div>
               {viewer.name === yourName && (
                 <div id="Controls-Panel" className="mt-2">
                   <button
                     id="Viewer-Exit"
                     className="btn-secondary-1 p-2 rounded-full bg-gray-600 hover:bg-red-700"
                   >
                     <IoExit className="text-2xl text-red-500" />
                   </button>
                 </div>
               )}
             </div>
           ))
         ) : (
           <div className="col-span-full text-center text-gray-400">
             No Listeners... <span className="text-2xl">😔</span>
           </div>
         )}
       </div>
     </div>

     {/* Live Chat Section */}
     <div id="Live-Chat-Section" className="w-11/12 max-w-3xl mt-6">
       <h2
         id="LIVE-CHAT-HEADING"
         className="bg-gray-800 text-white text-center py-2 rounded-t-lg"
       >
         LIVE CHAT SECTION
       </h2>
       <div
         id="Chat-Section"
         className="bg-gray-900 p-4 rounded-b-lg space-y-2 max-h-60 overflow-y-auto"
       >
         {Array.isArray(allMessages) && allMessages.length > 0 ? (
           allMessages.map((item) => (
             <div
               id="Main-Message-Div"
               key={item.name}
               className="flex items-center bg-gray-700 text-gray-200 rounded-md p-2"
             >
               <div
                 id="Profile-Details"
                 className="flex flex-col items-center mr-4"
               >
                 <img
                   src={item.profilePhoto}
                   className="h-8 w-8 rounded-full mb-1"
                   alt="Sender Profile"
                 />
                 <div id="Sender-Name" className="text-xs font-medium">
                   {item.name.split(" ")[0]}
                 </div>
               </div>
               <div id="Message-Time" className="flex flex-col flex-1">
                 <div id="Sender-Message" className="text-sm">
                   {item.message}
                 </div>
                 <div id="Sender-Time" className="text-xs text-gray-400 mt-1">
                   {item.time}
                 </div>
               </div>
             </div>
           ))
         ) : (
           <div className="text-center text-gray-400">No messages yet.</div>
         )}
       </div>

       {/* Message Input */}
       <form
         id="Message-Panel"
         onSubmit={(ev) => sendMessage(ev)}
         className="flex items-center bg-gray-800 p-4 rounded-md mt-4"
       >
         <input
           type="text"
           id="Message-Input"
           placeholder="Send a message..."
           value={message}
           className="bg-gray-700 text-white placeholder-gray-400 rounded-md p-2 flex-1 focus:outline-none mr-2"
           onChange={(ev) => setMessage(ev.target.value)}
         />
         <button
           id="Send-Message"
           className="btn-secondary-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
         >
           SEND
         </button>
       </form>
     </div>
   </div>
 );

};
