# Use the official .NET SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /src

# Copy the solution file into the container
COPY DeepDrunkTalks.Backend.sln .

# Copy the project directories into the container
COPY DDT.Backend.DAL/DDT.Backend.DAL.csproj DDT.Backend.DAL/
COPY DDT.Backend.BLL/DDT.Backend.BLL.csproj DDT.Backend.BLL/
COPY DDT.Backend.API/DDT.Backend.API.csproj DDT.Backend.API/
COPY DDT.Backend.Common/DDT.Backend.Common.csproj DDT.Backend.Common/
COPY DDT.Backend.UTL/DDT.Backend.UTL.csproj DDT.Backend.UTL/

# Copy the rest of the source files into the container
COPY DDT.Backend.DAL/ DDT.Backend.DAL/
COPY DDT.Backend.BLL/ DDT.Backend.BLL/
COPY DDT.Backend.API/ DDT.Backend.API/
COPY DDT.Backend.Common/ DDT.Backend.Common/
COPY DDT.Backend.UTL/ DDT.Backend.UTL/

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
