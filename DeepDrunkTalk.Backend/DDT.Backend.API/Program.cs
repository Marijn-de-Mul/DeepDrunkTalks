using DDT.Backend.UserService.BLL.Helpers;
using DDT.Backend.UserService.Common.Interfaces;
using DDT.Backend.UserService.BLL.Services;
using DDT.Backend.UserService.Common;
using DDT.Backend.UserService.DAL.Repositories;
using Microsoft.EntityFrameworkCore;

EnvironmentVariables.LoadEnvironments();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseNpgsql(ConnectionStringHelper.GetConnectionString()));

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<AuthService>(); 

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") 
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
