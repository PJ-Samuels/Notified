import React from "react";
import "./css/signup.css";

export default function Signup(){
    return (
        <div className="signup">
            <h1 className = "signText"> Signup Now </h1>
            <div className = "box">
                <form className = "form">
                    <label for = "firstName"><b>First Name</b></label>
                    <input type = "text" name = "firstName" placeholder="First Name"></input>
                    <label for = "lastName"><b>Last Name</b></label>
                    <input type = "text" name = "lastName" placeholder="Last Name"></input>
                    <label for = "email"><b>Email</b></label>
                    <input type = "text" name = "email" placeholder="Enter Email" ></input>
                    <label for = "password"><b>Password</b></label>
                    <input type = "text" name = "password" placeholder="Enter Password" ></input>
                    <label for = "confirmPassword"><b>Confirm Password</b></label>
                    <input type = "text" name = "confirmPassword" placeholder="Confirm Password"></input> 
                    <input type = "submit" value = "Submit"  href = "/userdashboard"></input>      
                </form>
            </div>
        </div>
    )
}