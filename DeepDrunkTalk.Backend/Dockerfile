FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY DeepDrunkTalks.Backend.sln .

COPY DDT.Backend.DAL/DDT.Backend.DAL.csproj DDT.Backend.DAL/
COPY DDT.Backend.BLL/DDT.Backend.BLL.csproj DDT.Backend.BLL/
COPY DDT.Backend.API/DDT.Backend.API.csproj DDT.Backend.API/
COPY DDT.Backend.Common/DDT.Backend.Common.csproj DDT.Backend.Common/
COPY DDT.Backend.UTL/DDT.Backend.UTL.csproj DDT.Backend.UTL/

COPY DDT.Backend.DAL/ DDT.Backend.DAL/
COPY DDT.Backend.BLL/ DDT.Backend.BLL/
COPY DDT.Backend.API/ DDT.Backend.API/
COPY DDT.Backend.Common/ DDT.Backend.Common/
COPY DDT.Backend.UTL/ DDT.Backend.UTL/

RUN dotnet restore "DeepDrunkTalks.Backend.sln"

RUN ls -l /src
RUN ls -l /app

WORKDIR /app

RUN dotnet build "DeepDrunkTalks.Backend.sln" -c Release -o /app/build

RUN dotnet publish "DeepDrunkTalks.Backend.sln" -c Release -o /app/publish

WORKDIR /app/publish

ENTRYPOINT ["dotnet", "DDT.Backend.API.dll"]
