use axum::{
    http::{Method, header},
    middleware,
};
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::CorsLayer;

mod auth;
mod config;
mod database;
mod google_auth;
mod responses;
mod routes;
mod school_data_loader;
mod themes;
mod types;
mod v4_routes;

use config::AppConfig;
use database::Database;
use routes::{AppState, SharedAppState};
use school_data_loader::SchoolDataLoader;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    // Load configuration from environment variables
    let config = AppConfig::from_env().map_err(|e| anyhow::anyhow!(e))?;
    println!("{:#?}", config);
    println!("Starting server with configuration loaded");

    // Create database connection with config
    let database = Arc::new(Database::new(&config).await?);

    // Run database migrations
    database.run_migrations().await?;

    // Create the school data loader
    let school_data_loader = Arc::new(SchoolDataLoader::new().await?);

    // Create app state
    let app_state: SharedAppState = Arc::new(AppState {
        school_data_loader,
        database,
        config: Arc::new(config),
    });

    let cors = CorsLayer::new()
        .allow_origin(if app_state.config.is_production {
            vec![
                "https://periods.io".parse().unwrap(),
                "https://account.periods.io".parse().unwrap(),
            ]
        } else {
            vec![
                "http://localhost:8080".parse().unwrap(),
                "http://localhost:8082".parse().unwrap(),
            ]
        })
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::HeaderName::from_static("x-requested-with"),
        ])
        .allow_credentials(true);

    // Create main router with existing routes
    let main_router = routes::create_router();

    // Create v4 router with auth middleware
    let v4_router = v4_routes::create_v4_router().layer(middleware::from_fn_with_state(
        app_state.clone(),
        auth::AuthMiddleware::authenticate,
    ));

    // Combine routers and apply state
    let app = main_router
        .nest("/v4", v4_router)
        .with_state(app_state.clone())
        .layer(CookieManagerLayer::new())
        .layer(cors);

    let listener = TcpListener::bind(format!("0.0.0.0:{}", app_state.config.port)).await?;

    println!("Server running on port {}", app_state.config.port);
    axum::serve(listener, app).await?;

    Ok(())
}
