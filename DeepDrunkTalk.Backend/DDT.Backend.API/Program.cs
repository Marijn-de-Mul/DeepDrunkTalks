using System.Text;
using DDT.Backend.API.Middleware;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.DAL.Repositories;
using DDT.Backend.BLL.Helpers;
using DDT.Backend.BLL.Services;
using DDT.Backend.BLL.Services.Audio;
using DDT.Backend.BLL.Services.File;
using DDT.Backend.BLL.Services.Setting;
using DDT.Backend.Common.Logger;
using DDT.Backend.DAL;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

var environment = builder.Environment;

if (!environment.IsProduction())
{
    EnvironmentVariables_old.LoadEnvironments();
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.EnableAnnotations(); 
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(ConnectionStringHelper.GetConnectionString()));

builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<ConversationService>();

builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>(); 

builder.Services.AddScoped<SettingService>(); 

builder.Services.AddScoped<AudioService>(); 

builder.Services.AddScoped<FileService>(); 

builder.Services.AddScoped<IFileHandler, FileHandler>();
builder.Services.AddScoped<IFileOperations, FileOperations>();
    
builder.Services.AddScoped<DDT.Backend.Common.ILogger, DDT.Backend.Common.Logger.Logger>();

builder.Services.AddSingleton<DDT.Backend.Common.Logger.Logger>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("d349e3a2f3b7cafa3737752ef9a1da8271ff6ff54666ceabe18033a0721daca882c490ac264cd867d6c6ff5ac64e06889be2aa342f912186b749ff7d18ef5824c8f770c5eefee1e4b7f386c598d9939d3cfce32c6ae51a022367862ce98ebd9caa7659092e8200061a27c680a21f74920dd0d64c345cbfc5fe86e7db2ba1d7b22a497354cd9bc06247f9bcfa6b2966ab5587453967f9018d69327c1ef5664ef4c18f4caa6173c030f3492fa9bfb45a91dc636cde1a7eaab2b7dcd782bfc28d818dc86c49dcc0ee2e8a86f87106c7e32327ca94dee546356135882ed2dcbd0158b1022dc0f40d927f311ad49f399754c4a5d5eeed07181349b87bc1b408886da1583f8883fe51d07f792bb2026b40d03f94328e83196e0d8680e4fcfb2febb37cbe45588110a65c7bfd3b1f4ca9e30a88b03d193bb9467bc1d40f8c974cf14bae43eaa9281ff47c7fc8c978daf22e1e973f65daa0993013cb6c053fce88fab67f9e447562f408885d4a8e16c189c8d9b4b1df4de2e00ace3ca2c5d885972e597714076b777320a0e21bc357ff7f4b9204fa307b654a306a1a5da26789cdaf7cf33c7fc64e45e4f22521914e7b3141c6454aebb85b39a4388e6308950990fb3dba37488c96e1d180ff170c8852e560fa6a0752369e861e99a29db23ea6e3e255528b990d1b2e8a1588edce881903759f20e18546323d9cbbac0699ebf131b019f3")),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();  

builder.Services.AddCors(options =>
{
    if (!environment.IsProduction())
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
    }
    
    if (environment.IsProduction())
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            policy.WithOrigins("http://frontend:3000", "http://frontend:3000", "https://ddt.marijndemul.nl:81")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); 
        });
    }
});

builder.Services.AddSingleton(_ => Environment.GetEnvironmentVariable("JWT_SECRET"));

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8079); 
    // options.ListenAnyIP(8080, listenOptions =>
    // {
    //     listenOptions.UseHttps("/etc/ssl/certs/mycertificate.crt", "/etc/ssl/private/mycertificate.key");
    // });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigins");

app.UseMiddleware<TokenValidator>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();  

app.Run();
