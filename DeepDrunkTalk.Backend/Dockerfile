FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["DeepDrunkTalk.Backend/DeepDrunkTalks.Backend.sln", "DeepDrunkTalk.Backend/"]
COPY ["DeepDrunkTalk.Backend/DDT.Backend.API/", "/app/DDT.Backend.API/"]
RUN dotnet restore "DeepDrunkTalk.Backend/DeepDrunkTalks.Backend.sln"

COPY . .

WORKDIR "/src/DeepDrunkTalk.Backend/DDT.Backend.API"
RUN dotnet publish "DDT.Backend.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

COPY DeepDrunkTalk.Backend/DDT.Backend.API/.env /app/.env

ENTRYPOINT ["dotnet", "DDT.Backend.API.dll"]
