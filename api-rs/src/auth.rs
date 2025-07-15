use axum::{
    body::{Body, to_bytes},
    extract::{FromRequestParts, Request, State},
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

// Helper function to verify JWT token
fn verify_jwt_token(token: &str, jwt_secret: &str) -> Result<Claims, AppError> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.required_spec_claims.clear(); // Don't require exp, iat, etc.

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &validation,
    )
    .map(|token_data| token_data.claims)
    .map_err(|e| anyhow::anyhow!("JWT verification failed: {:?}", e).into())
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
    pub async fn authenticate(
        State(app_state): State<SharedAppState>,
        mut request: Request,
        next: Next,
    ) -> Result<Response, AppError> {
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

        let jwt_secret = &app_state.config.jwt_secret;
        let cookie_config = CookieConfig::new(app_state.config.is_production);

        // Try to get existing JWT from cookies
        if let Some(jwt_cookie) = cookies.get("periods_io") {
            let jwt_value = jwt_cookie.value().to_string();
            if let Ok(claims) = verify_jwt_token(&jwt_value, jwt_secret) {
                // Valid token - refresh cookie and add device_id to request
                let mut cookie = Cookie::new("periods_io", jwt_value);
                configure_cookie(&mut cookie, &cookie_config);
                cookies.add(cookie);

                // Add device_id to request extensions
                request.extensions_mut().insert(claims.device_id);
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
        let init_request = serde_json::from_slice::<InitRequest>(&body_bytes)
            .map_err(|e| anyhow::anyhow!("Failed to parse init request JSON: {:?}", e))?;

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_jwt_token_empty_device_id() {
        let device_id = "";
        let jwt_secret = "test-secret";

        let result = create_jwt_token(device_id, jwt_secret);
        assert!(result.is_ok()); // Empty device_id should still create a valid token
    }

    #[test]
    fn test_verify_jwt_token_wrong_secret() {
        let device_id = "test-device-789";
        let jwt_secret = "test-secret";
        let wrong_secret = "wrong-secret";

        // Create token with correct secret
        let token = create_jwt_token(device_id, jwt_secret).unwrap();

        // Try to verify with wrong secret
        let result = verify_jwt_token(&token, wrong_secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_jwt_token_malformed() {
        let jwt_secret = "test-secret";
        let malformed_token = "not.a.valid.jwt.token";

        let result = verify_jwt_token(malformed_token, jwt_secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_jwt_token_empty() {
        let jwt_secret = "test-secret";
        let empty_token = "";

        let result = verify_jwt_token(empty_token, jwt_secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_jwt_roundtrip() {
        let device_id = "roundtrip-test-device";
        let jwt_secret = "roundtrip-secret";

        // Create token
        let token = create_jwt_token(device_id, jwt_secret).unwrap();

        // Verify token and extract claims
        let claims = verify_jwt_token(&token, jwt_secret).unwrap();

        // Should get back the original device_id
        assert_eq!(claims.device_id, device_id);
    }

    #[test]
    fn test_jwt_unicode_characters() {
        let device_id = "device-测试-🚀";
        let jwt_secret = "secret-测试-🔐";

        let token = create_jwt_token(device_id, jwt_secret).unwrap();
        let claims = verify_jwt_token(&token, jwt_secret).unwrap();

        assert_eq!(claims.device_id, device_id);
    }
}
