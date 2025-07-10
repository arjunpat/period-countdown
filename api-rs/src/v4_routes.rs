use axum::{
    Json, Router,
    extract::{Request, State},
    middleware,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use std::collections::HashMap;

use crate::auth::{AuthMiddleware, ClientIp, DeviceId};
use crate::database::Hit;
use crate::google_auth;
use crate::responses::{error_response, success_response};
use crate::routes::SharedAppState;
use crate::themes;
use crate::types::{
    AccountResponse, LoginRequest, ThanksRequest, ThemeResponse, UpdatePreferencesRequest,
};

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
        .layer(middleware::from_fn(AuthMiddleware::authenticate))
}

async fn init_handler() -> impl IntoResponse {
    // The auth middleware handles device creation for init
    success_response(())
}

async fn account_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Response {
    let user = match app_state.database.get_user_by_device(&device_id).await {
        Ok(Some(user)) => user,
        Ok(None) => return error_response("user_not_found"),
        Err(_) => return error_response("database_error"),
    };

    let admin_emails: Vec<String> = std::env::var("ADMIN_EMAILS")
        .unwrap_or_default()
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    // Get valid school IDs
    let valid_schools = match app_state.school_data_loader.get_schools_directory().await {
        Ok(schools) => {
            if let Some(schools_obj) = schools.as_object() {
                schools_obj.keys().cloned().collect::<Vec<_>>()
            } else {
                vec!["mvhs".to_string()]
            }
        }
        Err(_) => vec!["mvhs".to_string()],
    };

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

    // Parse period names and rooms from JSON
    let period_names: HashMap<String, String> = user
        .period_names
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    let rooms: HashMap<String, crate::types::RoomData> = user
        .rooms
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    let school = if valid_schools.contains(&user.school.clone().unwrap_or_default()) {
        user.school.unwrap_or_else(|| "mvhs".to_string())
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

    success_response(response)
}

async fn login_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(login_req): Json<LoginRequest>,
) -> Response {
    let token_info = match google_auth::validate_google_token(&login_req.google_token).await {
        Ok(info) => info,
        Err(_) => return error_response("bad_token"),
    };

    // Create or update user
    if let Err(_) = app_state
        .database
        .create_or_update_user(
            &token_info.email,
            Some(token_info.given_name),
            Some(token_info.family_name),
            Some(token_info.picture),
        )
        .await
    {
        return error_response("database_error");
    }

    // Link device to user
    if let Err(_) = app_state
        .database
        .login_device(&device_id, &token_info.email)
        .await
    {
        return error_response("database_error");
    }

    success_response(())
}

async fn logout_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Response {
    if let Err(_) = app_state.database.logout_device(&device_id).await {
        return error_response("database_error");
    }

    success_response(())
}

async fn thanks_handler(
    DeviceId(device_id): DeviceId,
    ClientIp(ip): ClientIp,
    State(app_state): State<SharedAppState>,
    Json(thanks_req): Json<ThanksRequest>,
) -> Response {
    // Validate request (mimicking express-validator behavior)
    if let Err(_) = thanks_req.validate() {
        return error_response("validation_error");
    }

    let hit = Hit {
        time: chrono::Utc::now().timestamp_millis(),
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

    if let Err(_) = app_state.database.create_hit(hit).await {
        return error_response("database_error");
    }

    success_response(())
}

async fn thanks_again_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Response {
    if let Err(_) = app_state.database.update_hit_leave_time(&device_id).await {
        return error_response("database_error");
    }

    success_response(())
}

async fn error_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(error_data): Json<serde_json::Value>,
) -> Response {
    let error_string = serde_json::to_string(&error_data).unwrap_or_default();

    if error_string.len() > 4000 {
        return success_response("error_too_long");
    }

    if let Err(_) = app_state
        .database
        .create_error(Some(device_id), Some(error_string))
        .await
    {
        return error_response("database_error");
    }

    success_response(())
}

async fn update_preferences_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    Json(prefs_req): Json<UpdatePreferencesRequest>,
) -> Response {
    // Get valid school IDs
    let valid_schools = match app_state.school_data_loader.get_schools_directory().await {
        Ok(schools) => {
            if let Some(schools_obj) = schools.as_object() {
                schools_obj.keys().cloned().collect::<Vec<_>>()
            } else {
                vec!["mvhs".to_string()]
            }
        }
        Err(_) => vec!["mvhs".to_string()],
    };

    // Validate request
    if let Err(_msg) = prefs_req.validate(&valid_schools) {
        return error_response("bad_data");
    }

    // Sanitize rooms
    let good_rooms = prefs_req.sanitize_rooms();

    // Convert to JSON values - use the sanitized rooms, not the original ones
    let period_names_json = serde_json::to_value(&prefs_req.period_names).ok();
    let rooms_json = serde_json::to_value(&good_rooms).ok();

    // Update preferences and get email
    let email = match app_state
        .database
        .update_user_preferences_and_get_email(
            &device_id,
            Some(prefs_req.school),
            Some(prefs_req.theme),
            period_names_json,
            rooms_json,
        )
        .await
    {
        Ok(Some(email)) => email,
        Ok(None) => return error_response("not_logged_in"),
        Err(_) => return error_response("database_error"),
    };

    // Record update preference event
    if let Err(_) = app_state.database.record_upt_pref(&email, &device_id).await {
        return error_response("database_error");
    }

    success_response(())
}

async fn notif_on_handler(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
) -> Response {
    match app_state.database.notif_on(&device_id).await {
        Ok(true) => success_response(()),
        Ok(false) => error_response("already_on"),
        Err(_) => error_response("database_error"),
    }
}
