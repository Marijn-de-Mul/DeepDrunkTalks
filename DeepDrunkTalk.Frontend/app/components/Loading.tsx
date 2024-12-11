import React from "react";
import { Loader } from "@mantine/core";

const Loading: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", 
        backgroundColor: "rgba(0, 0, 0, 0.0)", 
      }}

      data-testid={"loader"}
    >
      <Loader color="rgba(0, 0, 0, 1)" size="xl" type="dots" />
    </div>
  );
};

export default Loading;
