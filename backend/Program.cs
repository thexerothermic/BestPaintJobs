using backend.Data;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);

var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
if (origins == null || origins.Length == 0)
{
    throw new InvalidOperationException("No allowed origins specified in configuration.");
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication("Bearer")
       .AddJwtBearer("Bearer", options =>
       {
           options.Authority = builder.Configuration["Auth0:Domain"];
           options.Audience = builder.Configuration["Auth0:Audience"];
           options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
           {
               NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
           };
       });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<backend.Authentication.AuthenticationService>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
