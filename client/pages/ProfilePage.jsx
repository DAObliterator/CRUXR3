import React from 'react';
import "./ProfilePage.css";
import { useParams } from 'react-router-dom';

export const ProfilePage = () => {
  return (
    <div id="Profile-Page-Main">
        <CompleteProfile></CompleteProfile>
    </div>
  )
}


const CompleteProfile = () => {

    const { username }= useParams();

    

    return (
        <div>
            <h2>Hello { username } Finish Setting Up Your Profile...  </h2>
        </div>
    )
}
