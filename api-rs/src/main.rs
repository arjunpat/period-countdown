use axum::http::{Method, header};
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::{Any, CorsLayer};

mod auth;
mod database;
mod google_auth;
mod responses;
mod routes;
mod school_data_loader;
mod themes;
mod types;
mod v4_routes;

use database::Database;
use routes::{AppState, SharedAppState};
use school_data_loader::SchoolDataLoader;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    // Create database connection
    let database = Arc::new(Database::new().await?);

    // Run database migrations
    database.run_migrations().await?;

    // Create the school data loader
    let school_data_loader = Arc::new(SchoolDataLoader::new());

    // Create app state
    let app_state: SharedAppState = Arc::new(AppState {
        school_data_loader,
        database,
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

    // Create main router with existing routes
    let main_router = routes::create_router();

    // Create v4 router
    let v4_router = v4_routes::create_v4_router();

    // Combine routers
    let app = main_router
        .nest("/v4", v4_router)
        .with_state(app_state)
        .layer(CookieManagerLayer::new())
        .layer(cors);

    let port = std::env::var("PORT").unwrap_or("8080".to_string());
    let listener = TcpListener::bind(format!("0.0.0.0:{}", port)).await?;

    println!("Server running on port {}", port);
    axum::serve(listener, app).await?;

    Ok(())
}
