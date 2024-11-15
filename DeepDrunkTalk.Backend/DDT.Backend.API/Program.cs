using DDT.Backend.ConversationService.Common.Interfaces;
using DDT.Backend.ConversationService.DAL;
using DDT.Backend.ConversationService.DAL.Repositories;
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

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(ConnectionStringHelper.GetConnectionString()));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<UserService>(); 

builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<ConversationService>(); 

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
