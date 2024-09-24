import type { MetaFunction } from "@remix-run/node";
import { Button , Divider } from '@mantine/core';

import "../assets/css/general.css"
import MainMenu from "./_mainmenu";

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Login" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

let authenticated = new Boolean(true); 

export default function Auth() {
  return (
    IsAuthenticated()
  );
}

function IsAuthenticated() { 
    if (authenticated == true) { 
        return (
            MainMenu()
        )
    }

    else { 
        return (
            <p>Ooops, something went wrong...</p>
        )
    }
}