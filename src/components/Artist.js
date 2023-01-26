import React from 'react';
import "./css/Artist.css"

export default function Artist({artistImg = "./images/JID.jpeg", artistName = ""}) {
    return (
        <div className = "artist" >
            <img className = "artist-image" src = {artistImg} alt = "filler"></img>
        </div>
    )
}