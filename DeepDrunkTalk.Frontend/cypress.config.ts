import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {

    viewportWidth: 1280,  
    viewportHeight: 720,
    
    baseUrl: "http://localhost:5173",

    setupNodeEvents(on, config) {
      
    },
  },
});
