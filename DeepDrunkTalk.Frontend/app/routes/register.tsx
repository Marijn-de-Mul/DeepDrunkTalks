import type { MetaFunction } from "@remix-run/node";
import { Button, Box, Input, Image, Text, Divider } from '@mantine/core';

import logo from "~/assets/img/logo.png"; 

export const meta: MetaFunction = () => {
  return [
    { title: "DeepDrunkTalks - Register" },
    { name: "description", content: "Welcome to DeepDrunkTalks" },
  ];
};

export default function Register() {

  return (

    <>

    <Box
    
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
        marginBottom: "2vh"
      }}
    
    > 

        <Image 

        src={logo}

        style={{
            maxWidth: "70vw", 
            width: "auto", 
            marginTop: "10vh"
        }}

        />

    </Box>

    <Box

      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", 
        marginBottom: "2vh"
      }}

    > 

        <Text
        
          style={{
            fontWeight: "bolder",
            fontSize: "2em"
          }}
        
        >Register</Text>

    </Box>

    <Box
    
      style={{
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center'
      }}
    
    >

        <Input variant="filled" placeholder="Username" 
                
                style={{
                    margin: "2vw",
                    width: "70vw" 
                }}
            
          />


        <Input variant="filled" placeholder="E-Mail" 
        
            style={{
                margin: "2vw",
                width: "70vw" 
            }}
        
        />

        <Input variant="filled" placeholder="Password" 
        
            style={{
                margin: "2vw",
                width: "70vw" 
            }}
        
        />

        <Input variant="filled" placeholder="Repeat Password" 
                
                style={{
                    margin: "2vw",
                    width: "70vw" 
                }}
            
        />

        <Button fullWidth color="rgba(0, 0, 0, 1)" size="lg" 
        
            style={{
                marginTop: "2vw",
                width: "70vw"
            }}
        
        >REGISTER</Button>

        <a href="./login"> 
          <Button fullWidth color="rgba(0, 0, 0, 1)" size="lg" 
                
              style={{
                  marginTop: "2vw",
                  width: "70vw"
              }}
    
          >LOGIN INSTEAD</Button>
        </a>

    </Box>   

    <Divider color="black"

        style={{
          marginTop: "2vh"
        }}

      ></Divider>

      <Box 

        style={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center"
        }}

      > 

        <Text 
        
          style={{
            marginTop: "2vh", 
            fontStyle: "italic"
          }}
        
        > DeepDrunkTalks - 2024 © </Text>

      </Box>


    </>
  )
}
