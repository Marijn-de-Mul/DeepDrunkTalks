import type { MetaFunction } from "@remix-run/node";
import { Button , Divider } from '@mantine/core';

import logo from "../assets/img/logo.png"; 

import "../assets/css/general.css"
import "../assets/css/mainmenu.css"

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Main Menu" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function MainMenu() {
  return (
    <> 

    <div
      
      className="logodiv"

    > 
      <img 
    
        className="logo"
      
        src={logo}
      
      />

    </div>

    <div  
    
      className="menubuttonsdiv"
    
    > 

      <Button className="menubutton" variant="filled" color="rgba(0, 0, 0, 1)" size="xl">START GAME</Button>;

      <Button className="menubutton" variant="filled" color="rgba(0, 0, 0, 1)" size="xl">SOBER MODE</Button>;

      <Button className="menubutton" variant="filled" color="rgba(0, 0, 0, 1)" size="xl">SETTINGS</Button>;

    </div>

    <Divider color="black" className="divider"></Divider>
    
    <div 
    
      className="footerdiv"

    > 

      <p className="footertext"> DeepDrunkTalks - 2024 © </p>

    </div>

    </>
  );
}
