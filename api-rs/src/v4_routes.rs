use axum::{
    Json, Router,
    extract::State,
    response::Response,
    routing::{get, post},
};
use std::collections::HashMap;

use crate::auth::{ClientIp, DeviceId};
use crate::database::Hit;
use crate::google_auth;
use crate::responses::{AppError, success_response};
use crate::routes::SharedAppState;
use crate::themes;
use crate::types::{
    AccountResponse, LoginRequest, ThanksRequest, ThemeResponse, UpdatePreferencesRequest,
};

// Helper function to parse user JSON fields safely
fn parse_user_data(
    user: &crate::database::User,
) -> (
    HashMap<String, String>,
    HashMap<String, crate::types::RoomData>,
) {
    let period_names: HashMap<String, String> = user
        .period_names
        .as_ref()
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let rooms: HashMap<String, crate::types::RoomData> = user
        .rooms
        .as_ref()
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    (period_names, rooms)
}

pub fn create_v4_router() -> Router<SharedAppState> {
    Router::new()
        .route("/init", post(init_handler))
        .route("/account", get(account_handler))
        .route("/login", post(login_handler))
        .route("/logout", post(logout_handler))
        .route("/thanks", post(thanks_handler))
        .route("/thanks-again", post(thanks_again_handler))
        .route("/error", post(error_handler))
        .route("/update-preferences", post(update_preferences_handler))
        .route("/notif-on", post(notif_on_handler))
}

async fn init_handler() -> Result<Response, AppError> {
    // The auth middleware handles device creation for init
    Ok(success_response(()))
}

async fn account_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    let user = app_state
        .database
        .get_user_by_device(&device_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("User not found for device: {}", device_id))?;

    let admin_emails = &app_state.config.admin_emails;
    let (period_names, rooms) = parse_user_data(&user);

    // Validate theme
    let theme_index = user.theme.unwrap_or(0);
    let themes_data = themes::get_themes();
    let empty_vec = vec![];
    let themes_array = themes_data.as_array().unwrap_or(&empty_vec);
    let theme_index = if (theme_index as usize) < themes_array.len() {
        theme_index
    } else {
        0
    };

    let school = if app_state
        .school_data_loader
        .is_valid_school(&user.school.clone().unwrap_or_default())
        .await
    {
        user.school.unwrap()
    } else {
        "mvhs".to_string()
    };

    let response = AccountResponse {
        email: user.email.clone(),
        profile_pic: user.profile_pic,
        first_name: user.first_name,
        last_name: user.last_name,
        theme: ThemeResponse {
            theme: theme_index,
            theme_data: themes_array[theme_index as usize].clone(),
        },
        admin: if admin_emails.contains(&user.email) {
            Some(true)
        } else {
            None
        },
        school,
        period_names,
        rooms,
    };

    Ok(success_response(response))
}

async fn login_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(login_req): Json<LoginRequest>,
) -> Result<Response, AppError> {
    let token_info = google_auth::validate_google_token(&login_req.google_token)
        .await
        .map_err(|e| anyhow::anyhow!("Google token validation failed: {:?}", e))?;

    // Create or update user
    app_state
        .database
        .create_or_update_user(
            &token_info.email,
            Some(token_info.given_name),
            Some(token_info.family_name),
            Some(token_info.picture),
        )
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create or update user: {:?}", e))?;

    // Link device to user
    app_state
        .database
        .login_device(&device_id, &token_info.email)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to link device to user: {:?}", e))?;

    Ok(success_response(()))
}

async fn logout_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    app_state
        .database
        .logout_device(&device_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to logout device: {:?}", e))?;
    Ok(success_response(()))
}

async fn thanks_handler(
    DeviceId(device_id): DeviceId,
    ClientIp(ip): ClientIp,
    State(app_state): State<SharedAppState>,
    Json(thanks_req): Json<ThanksRequest>,
) -> Result<Response, AppError> {
    // Validate request (mimicking express-validator behavior)
    thanks_req
        .validate()
        .map_err(|e| anyhow::anyhow!("Thanks request validation failed: {:?}", e))?;

    let hit = Hit {
        time: chrono::Utc::now().timestamp_millis() as u64,
        device_id: Some(device_id),
        leave_time: None,
        ip,
        pathname: Some(thanks_req.pathname),
        referrer: Some(thanks_req.referrer),
        version: Some(thanks_req.version),
        school: Some(thanks_req.school),
        period: Some(thanks_req.period),
        dc: Some(thanks_req.dc as u16),
        pc: Some(thanks_req.pc as u16),
        rt: Some(thanks_req.rt as u16),
        dns: Some(thanks_req.dns as u16),
        tti: Some(thanks_req.tti as u16),
        ttfb: Some(thanks_req.ttfb as u16),
        user_theme: thanks_req.user_theme,
        user_period: thanks_req.user_period,
    };

    app_state
        .database
        .create_hit(hit)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create hit: {:?}", e))?;
    Ok(success_response(()))
}

async fn thanks_again_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    app_state
        .database
        .update_hit_leave_time(&device_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to update hit leave time: {:?}", e))?;
    Ok(success_response(()))
}

async fn error_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(error_data): Json<serde_json::Value>,
) -> Result<Response, AppError> {
    let error_string = serde_json::to_string(&error_data).unwrap_or_default();

    if error_string.len() > 4000 {
        return Ok(success_response("error_too_long"));
    }

    app_state
        .database
        .create_error(Some(device_id), Some(error_string))
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create error record: {:?}", e))?;

    Ok(success_response(()))
}

async fn update_preferences_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(prefs_req): Json<UpdatePreferencesRequest>,
) -> Result<Response, AppError> {
    // Validate request
    prefs_req
        .validate()
        .map_err(|e| anyhow::anyhow!("Preferences validation failed: {:?}", e))?;



    // Sanitize rooms
    let good_rooms = prefs_req.sanitize_rooms();

    // Convert to JSON values - use the sanitized rooms, not the original ones
    let period_names_json = serde_json::to_value(&prefs_req.period_names).ok();
    let rooms_json = serde_json::to_value(&good_rooms).ok();

    // Update preferences and get email
    let email = app_state
        .database
        .update_user_preferences_and_get_email(
            &device_id,
            Some(prefs_req.school),
            Some(prefs_req.theme),
            period_names_json,
            rooms_json,
        )
        .await
        .map_err(|e| anyhow::anyhow!("Failed to update user preferences: {:?}", e))?
        .ok_or_else(|| anyhow::anyhow!("User not logged in for device: {}", device_id))?;

    // Record update preference event
    app_state
        .database
        .record_upt_pref(&email, &device_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to record update preference event: {:?}", e))?;

    Ok(success_response(()))
}

async fn notif_on_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    let result = app_state
        .database
        .notif_on(&device_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to turn on notifications: {:?}", e))?;

    if result {
        Ok(success_response(()))
    } else {
        Err(anyhow::anyhow!("Notifications already enabled for device: {}", device_id).into())
    }
}
