using DDT.Backend.Common.Interfaces;
using DDT.Backend.DAL.Repositories;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.BLL.Services;
using DDT.Backend.DAL;
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

builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

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
