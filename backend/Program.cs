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
builder.Services.AddScoped<backend.PaintJobCardModule.Services.PaintJobCardService>();

var s3Section = builder.Configuration.GetSection(backend.FilesModule.S3Options.SectionName);
var s3Options = s3Section.Get<backend.FilesModule.S3Options>();
if (s3Options == null
    || string.IsNullOrWhiteSpace(s3Options.BucketName)
    || string.IsNullOrWhiteSpace(s3Options.Region)
    || string.IsNullOrWhiteSpace(s3Options.PublicBaseUrl))
{
    throw new InvalidOperationException("S3 BucketName, Region and PublicBaseUrl must be specified in configuration.");
}
builder.Services.Configure<backend.FilesModule.S3Options>(s3Section);
builder.Services.AddSingleton<Amazon.S3.IAmazonS3>(_ =>
{
    var region = Amazon.RegionEndpoint.GetBySystemName(s3Options.Region);
    if (!string.IsNullOrWhiteSpace(s3Options.AccessKeyId) && !string.IsNullOrWhiteSpace(s3Options.SecretAccessKey))
    {
        var credentials = new Amazon.Runtime.BasicAWSCredentials(s3Options.AccessKeyId, s3Options.SecretAccessKey);
        return new Amazon.S3.AmazonS3Client(credentials, region);
    }
    return new Amazon.S3.AmazonS3Client(region);
});
builder.Services.AddScoped<backend.FilesModule.Services.FileStorageService>();
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
