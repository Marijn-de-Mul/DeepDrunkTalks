# Use the official .NET SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /src

# Copy the solution file into the container
COPY DeepDrunkTalks.Backend.sln .

# Copy all project directories into the container
COPY DDT.Backend.DAL/ /app/DDT.Backend.DAL/
COPY DDT.Backend.BLL/ /app/DDT.Backend.BLL/
COPY DDT.Backend.API/ /app/DDT.Backend.API/
COPY DDT.Backend.Common/ /app/DDT.Backend.Common/
COPY DDT.Backend.UTL/ /app/DDT.Backend.UTL/

# Restore the dependencies
RUN dotnet restore "DeepDrunkTalks.Backend.sln"

# Set the working directory to the API project directory
WORKDIR /app/DDT.Backend.API

# Build the project
RUN dotnet build "DeepDrunkTalks.Backend.sln" -c Release -o /app/build

# Publish the project
RUN dotnet publish "DeepDrunkTalks.Backend.sln" -c Release -o /app/publish

# Set the working directory to the published app
WORKDIR /app/publish

# Define the entry point for the application
ENTRYPOINT ["dotnet", "DDT.Backend.API.dll"]
