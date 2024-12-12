FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

RUN apt-get update && apt-get install -y openssl

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

RUN dotnet build "DeepDrunkTalks.Backend.sln" -c Release -o /app/build

RUN dotnet publish "DeepDrunkTalks.Backend.sln" -c Release -o /app/publish

RUN mkdir -p /etc/ssl/private /etc/ssl/certs && \
    openssl genpkey -algorithm RSA -out /etc/ssl/private/mycertificate.key -pkeyopt rsa_keygen_bits:2048 && \
    openssl req -new -key /etc/ssl/private/mycertificate.key -out /etc/ssl/private/mycertificate.csr -subj "/CN=localhost" && \
    openssl x509 -req -in /etc/ssl/private/mycertificate.csr -signkey /etc/ssl/private/mycertificate.key -out /etc/ssl/certs/mycertificate.crt

EXPOSE 8079
EXPOSE 8080

WORKDIR /app/publish

ENTRYPOINT ["dotnet", "DDT.Backend.API.dll"]

