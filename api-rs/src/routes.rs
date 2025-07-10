use axum::{
    Router,
    extract::{Path, State},
    response::{IntoResponse, Json, Response},
    routing::get,
};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::config::AppConfig;
use crate::database::Database;
use crate::responses::{ApiResponse, error_response, json_response};
use crate::school_data_loader::SchoolDataLoader;
use crate::themes;

pub struct AppState {
    pub school_data_loader: Arc<SchoolDataLoader>,
    pub database: Arc<Database>,
    pub config: Arc<AppConfig>,
}

pub type SharedAppState = Arc<AppState>;

// Create router with all routes
pub fn create_router() -> Router<SharedAppState> {
    Router::new()
        .route("/time", get(get_time))
        .route("/schedule/{school}", get(get_schedule))
        .route("/school/{school}", get(get_school))
        .route("/periods/{school}", get(get_periods))
        .route("/themes", get(get_themes))
        .route("/schools", get(get_schools))
        .fallback(not_found)
}

// Route handlers
async fn get_time() -> impl IntoResponse {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    Json(ApiResponse::success(timestamp))
}

async fn get_schedule(
    Path(school): Path<String>,
    State(app_state): State<SharedAppState>,
) -> Response {
    match app_state
        .school_data_loader
        .get_schedule_data(&school)
        .await
    {
        Ok(data) => json_response(data, "public, max-age=900"), // 15 minutes
        Err(error) => error_response(error),
    }
}

async fn get_school(
    Path(school): Path<String>,
    State(app_state): State<SharedAppState>,
) -> Response {
    match app_state.school_data_loader.get_school_data(&school).await {
        Ok(data) => json_response(data, "public, max-age=43200"), // 12 hours
        Err(error) => error_response(error),
    }
}

async fn get_periods(
    Path(school): Path<String>,
    State(app_state): State<SharedAppState>,
) -> Response {
    match app_state.school_data_loader.get_periods_data(&school).await {
        Ok(data) => json_response(data, "max-age=43200"), // 12 hours
        Err(error) => error_response(error),
    }
}

async fn get_themes() -> Response {
    let themes = themes::get_themes();
    json_response(themes, "max-age=43200")
}

async fn get_schools(State(app_state): State<SharedAppState>) -> Response {
    match app_state.school_data_loader.get_schools_directory().await {
        Ok(data) => json_response(data, "max-age=43200"), // 12 hours
        Err(error) => error_response(error),
    }
}

async fn not_found() -> impl IntoResponse {
    error_response("not_found")
}
