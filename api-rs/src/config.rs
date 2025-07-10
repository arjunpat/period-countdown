use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    // Server config
    pub port: String,
    pub node_env: String,
    pub is_production: bool,

    // Database config
    pub mysql_user: String,
    pub mysql_pass: String,
    pub mysql_host: String,
    pub mysql_db: String,

    // Auth config
    pub jwt_secret: String,

    // Admin config
    pub admin_emails: Vec<String>,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, String> {
        // Required environment variables
        let jwt_secret =
            env::var("JWT_SECRET").map_err(|_| "JWT_SECRET environment variable is required")?;
        let node_env =
            env::var("NODE_ENV").map_err(|_| "NODE_ENV environment variable is required")?;
        let mysql_user =
            env::var("MYSQL_USER").map_err(|_| "MYSQL_USER environment variable is required")?;
        let mysql_pass =
            env::var("MYSQL_PASS").map_err(|_| "MYSQL_PASS environment variable is required")?;
        let mysql_host =
            env::var("MYSQL_HOST").map_err(|_| "MYSQL_HOST environment variable is required")?;
        let mysql_db =
            env::var("MYSQL_DB").map_err(|_| "MYSQL_DB environment variable is required")?;

        // Server config with defaults
        let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
        let is_production = node_env == "production";

        // Admin emails with default empty list
        let admin_emails = env::var("ADMIN_EMAILS")
            .unwrap_or_default()
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        Ok(AppConfig {
            port,
            node_env,
            is_production,
            mysql_user,
            mysql_pass,
            mysql_host,
            mysql_db,
            jwt_secret,
            admin_emails,
        })
    }

    pub fn database_url(&self) -> String {
        format!(
            "mysql://{}:{}@{}/{}",
            self.mysql_user, self.mysql_pass, self.mysql_host, self.mysql_db
        )
    }
}
