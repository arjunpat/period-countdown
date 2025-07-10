use axum::http::{Method, header};
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod database;
mod responses;
mod routes;
mod school_data_loader;
mod themes;

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

    let app = routes::create_router().with_state(app_state).layer(cors);

    let port = std::env::var("PORT").unwrap_or("8080".to_string());
    let listener = TcpListener::bind(format!("0.0.0.0:{}", port)).await?;

    println!("Server running on port {}", port);
    axum::serve(listener, app).await?;

    Ok(())
}
