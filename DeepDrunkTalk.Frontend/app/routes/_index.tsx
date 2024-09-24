import type { MetaFunction } from "@remix-run/node";
import { Button } from '@mantine/core';

import logo from "../assets/img/logo.png"; 

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Index() {
  return (
    <> 

    <div> 
      <img src={logo}/>
    </div>


    <Button variant="outline" color="cyan">Button</Button>
    
    </>
  );
}
