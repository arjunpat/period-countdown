use axum::http::{Method, header};
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

mod responses;
mod routes;
mod school_data_loader;
mod themes;

use school_data_loader::SchoolDataLoader;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    // Create the school data loader
    let school_data_loader = Arc::new(SchoolDataLoader::new());

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

    let app = routes::create_router().with_state(school_data_loader).layer(cors);

    let port = std::env::var("PORT").unwrap_or("8080".to_string());
    let listener = TcpListener::bind(format!("0.0.0.0:{}", port)).await?;

    println!("Server running on port {}", port);
    axum::serve(listener, app).await?;

    Ok(())
}
