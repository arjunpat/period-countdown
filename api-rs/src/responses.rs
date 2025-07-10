use axum::{
    http::{HeaderMap, StatusCode, header},
    response::{IntoResponse, Json, Response},
};
use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct ApiResponse<T> {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error.into()),
        }
    }
}

pub fn build_headers(cache_control: &str) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert(header::CACHE_CONTROL, cache_control.parse().unwrap());
    headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());
    headers
}

pub fn json_response<T: Serialize>(data: T, cache_control: &str) -> Response {
    let headers = build_headers(cache_control);
    (StatusCode::OK, headers, Json(data)).into_response()
}

pub fn error_response(error: impl Into<String>) -> Response {
    Json(ApiResponse::<Value>::error(error)).into_response()
}

pub fn success_response<T: Serialize>(data: T) -> Response {
    Json(ApiResponse::success(data)).into_response()
}
