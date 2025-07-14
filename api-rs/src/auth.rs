use axum::{
    body::{Body, to_bytes},
    extract::{FromRequestParts, Request},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde_json;
use tower_cookies::Cookie;

use crate::responses::{AppError, error_response};
use crate::routes::SharedAppState;
use crate::types::{Claims, CookieConfig, InitRequest};

// Helper function to configure cookie properties
fn configure_cookie(cookie: &mut Cookie, config: &CookieConfig) {
    if let Some(domain) = &config.domain {
        cookie.set_domain(domain.clone());
    }
    cookie.set_max_age(tower_cookies::cookie::time::Duration::milliseconds(
        config.max_age,
    ));
    if config.secure {
        cookie.set_secure(true);
    }
    if let Some(same_site) = &config.same_site {
        cookie.set_same_site(match same_site.as_str() {
            "none" => tower_cookies::cookie::SameSite::None,
            "lax" => tower_cookies::cookie::SameSite::Lax,
            "strict" => tower_cookies::cookie::SameSite::Strict,
            _ => tower_cookies::cookie::SameSite::None,
        });
    }
}

// Helper function to create JWT token
fn create_jwt_token(device_id: &str, jwt_secret: &str) -> Result<String, AppError> {
    let claims = Claims {
        device_id: device_id.to_string(),
    };

    Ok(encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
    .map_err(|e| anyhow::anyhow!("JWT encoding failed: {:?}", e))?)
}

// Custom extractor for device ID
#[derive(Clone)]
pub struct DeviceId(pub String);

// Custom extractor for client IP
#[derive(Clone)]
pub struct ClientIp(pub Option<String>);

impl<S> FromRequestParts<S> for DeviceId
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<String>()
            .cloned()
            .map(DeviceId)
            .ok_or_else(|| error_response("unauthorized"))
    }
}

impl<S> FromRequestParts<S> for ClientIp
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let ip = parts
            .headers
            .get("x-forwarded-for")
            .and_then(|v| v.to_str().ok())
            .or_else(|| parts.headers.get("x-real-ip").and_then(|v| v.to_str().ok()))
            .map(|s| s.to_string());

        Ok(ClientIp(ip))
    }
}

pub struct AuthMiddleware;

impl AuthMiddleware {
    pub async fn authenticate(mut request: Request, next: Next) -> Result<Response, AppError> {
        // Skip OPTIONS requests
        if request.method() == "OPTIONS" {
            return Ok(next.run(request).await);
        }

        // Get cookies from request extensions (set by CookieManagerLayer)
        let cookies = request
            .extensions()
            .get::<tower_cookies::Cookies>()
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("Cookies not found in request extensions"))?;

        // Get state from request extensions (set by with_state)
        let app_state = request
            .extensions()
            .get::<SharedAppState>()
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("App state not found in request extensions"))?;

        let jwt_secret = &app_state.config.jwt_secret;
        let cookie_config = CookieConfig::new(app_state.config.is_production);

        // Try to get existing JWT from cookies
        if let Some(jwt_cookie) = cookies.get("periods_io") {
            let jwt_value = jwt_cookie.value().to_string();
            if let Ok(token_data) = decode::<Claims>(
                &jwt_value,
                &DecodingKey::from_secret(jwt_secret.as_bytes()),
                &Validation::new(Algorithm::HS256),
            ) {
                // Valid token - refresh cookie and add device_id to request
                let mut cookie = Cookie::new("periods_io", jwt_value);
                configure_cookie(&mut cookie, &cookie_config);
                cookies.add(cookie);

                // Add device_id to request extensions
                request.extensions_mut().insert(token_data.claims.device_id);
                return Ok(next.run(request).await);
            }
        }

        // No valid token - need to create device
        // Extract InitRequest from request body
        let (parts, body) = request.into_parts();
        let body_bytes = to_bytes(body, usize::MAX)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to read request body: {:?}", e))?;

        // Parse the body as InitRequest
        let init_request = if body_bytes.is_empty() {
            // If no body provided, use defaults
            InitRequest {
                user_agent: "Unknown".to_string(),
                platform: "Unknown".to_string(),
                browser: vec!["Unknown".to_string()],
            }
        } else {
            // Try to parse the JSON body
            serde_json::from_slice::<InitRequest>(&body_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse init request JSON: {:?}", e))?
        };

        // Reconstruct the request with the same body for downstream handlers
        let reconstructed_body = Body::from(body_bytes);
        let mut request = Request::from_parts(parts, reconstructed_body);

        // Create new device with extracted data
        let device_id = app_state
            .database
            .create_device(
                Some(init_request.platform),
                Some(init_request.browser.join(",")),
                Some(init_request.user_agent),
            )
            .await
            .map_err(|e| anyhow::anyhow!("Failed to create device: {:?}", e))?;

        // Create JWT token and set cookie
        let token = create_jwt_token(&device_id, jwt_secret)?;
        let mut cookie = Cookie::new("periods_io", token);
        configure_cookie(&mut cookie, &cookie_config);
        cookies.add(cookie);

        // Add device_id to request extensions
        request.extensions_mut().insert(device_id);

        Ok(next.run(request).await)
    }
}
