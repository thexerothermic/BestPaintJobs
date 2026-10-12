# Best Paint Jobs

A web application created to find and share custom paint jobs of various vehicles.

## Getting Started

### Dependencies

Ensure you have the following installed on your local machine before setting up the project:
- **Node.js** (v18+ recommended) & npm
- **.NET SDK** (v8.0 or later)
- **Docker Desktop** (for running a local SQL Server database)
- An **Auth0 Account** (free tier is sufficient)

### Setup for local development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thexerothermic/best-paint-jobs.git
   cd best-paint-jobs
   ```

2. **Configure the Backend (.NET Core Web API):**
   Navigate to your backend directory and create or update your `appsettings.Development.json` file:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AllowedOrigins": ["http://localhost:5173"],
     "Auth0": {
       "Domain": "https://your-tenant.us.auth0.com/",
       "Audience": "https://api.bestpaintjobs.com"
     },
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost,1433;Database=BestPaintJobsDb;User Id=sa;TrustServerCertificate=True;Password=YourStrong@Password123"
     }
   }
   ```

3. **Configure the Frontend (React + Vite):**
   Navigate to your frontend directory and create a `.env` file with your Auth0 and backend configurations:
   ```env
   VITE_BACKEND_API_URL=http://localhost:5173
   VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
   VITE_AUTH0_CLIENT_ID=your_client_id
   VITE_AUTH0_AUDIENCE=https://api.bestpaintjobs.com
   ```
   *Note: Ensure your Auth0 Dashboard application is authorized to access the API (`https://api.bestpaintjobs.com`).*

### Executing Program

Follow these step-by-step instructions to run the application locally:

1. **Start the Local SQL Server Database (Docker):**
   Run this command in your terminal to spin up a local SQL Server container with a persistent volume:
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Password123" -p 1433:1433 -v mssql-data:/var/opt/mssql --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
   ```
   *(To stop or start the database later, use `docker stop sqlserver` or `docker start sqlserver`).*

2. **Run Database Migrations:**
   Ensure Entity Framework Core tools are installed on your machine.
   If they are not use this command to install them:
   '''bash
   dotnet tool install --global dotnet-ef
   ```
   After installing the tools, the cli will supply you a command to add the tools to your path.
   Use that command to add the tools to your path.
   Navigate to your backend project directory and apply the Entity Framework Core migrations to create your database tables:
   ```bash
   dotnet ef database update
   ```

3. **Start the Backend API:**
   Run the .NET Core web server:
   ```bash
   dotnet run
   ```

4. **Start the Frontend Client:**
   Open a separate terminal window, navigate to your frontend directory, install dependencies, and run the development server:
   ```bash
   npm install
   npm run dev
   ```
   *(Open `http://localhost:5173` in your browser).*

## Help

Common issues and troubleshooting tips:

- **Error: `401 Unauthorized` when hitting backend endpoints**
  - Check that your frontend Auth0Provider is passing the exact `audience` matching your backend configuration (`https://api.bestpaintjobs.com`).
- **Error: `Client is not authorized to access resource server`**
  - Go to your Auth0 Dashboard > **APIs** > your API > **Machine to Machine Applications** (or Applications), and toggle your frontend client application to **Authorized**.
- **Database connection failed**
  - Ensure your Docker container is running (`docker ps`) and that the `MSSQL_SA_PASSWORD` matches the password string inside your connection string.

## Authors

- Elijah Brian

## Version History

- 0.1
  - Initial Release with Auth0 authentication, React frontend, .NET Core backend, and local SQL Server integration.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.