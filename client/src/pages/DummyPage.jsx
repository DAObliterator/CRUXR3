import React , { useEffect , useContext } from 'react';
import { SocketContext } from '../context/socketContext';

export const DummyPage = () => {

    const socket = useContext(SocketContext);


    useEffect(() => {


        socket.on("some event" , () => {
            console.log("some event inside of useEffect in DummyPage.jsx ")
        })



    },[])



  return (
    <div  style={{minHeight: "100vh" , width: "100vw"}} >DummyPage</div>
  )
}
