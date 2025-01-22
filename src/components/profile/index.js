import React from "react";

//import style
import "./style.scss";

//import img
import avatar8 from "../../assets/images/avatars/2.jpg";

const Profile = () => {
  return (
    <div className="profile">
      
      {/* images*/}
      <div className="container">
        <div className="image">
          <img className="profile_img" src={avatar8} />
        </div>
      {/*image end*/}
  
      
      {/* profile details*/}
      <div className="profile_detail">
            
      <h3>Profile</h3>
            <div className="detail">
                <div className="detail_header" >
                  <span>Code:</span>
                  <span>Password:</span>
                  <span>Position:</span>
                </div>

                <div className="detail_content">
                  <span>123</span>
                  <span>123</span>
                  <span>Employee</span>
                </div>
              
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;