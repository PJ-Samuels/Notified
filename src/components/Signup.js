import React from "react";
import "./css/signup.css";

export default function Signup(){
    return (
        <div className="Signup">
            <h1 className = "signText"> Signup Now </h1>
            <div className = "box">
                <form className = "form">
                    <input type = "text" name = "firstName"></input>
                    <input type = "text" name = "lastName" ></input>
                    <input type = "text" name = "email" ></input>
                    <input type = "text" name = "password" ></input>
                    <input type = "text" name = "confirmPassword" ></input> 
                    <input type = "submit" value = "Submit"></input>      
                </form>
            </div>
        </div>
    )
}