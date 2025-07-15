use axum::{
    Router,
    extract::Request,
    extract::{Path, Query, State},
    middleware::Next,
    response::Response,
    routing::get,
};
use serde::Deserialize;
use serde_json::json;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::auth::DeviceId;
use crate::responses::{AppError, error_response, success_response};
use crate::routes::SharedAppState;

#[derive(Debug, Deserialize)]
pub struct BucketQuery {
    from: u64,
    to: u64,
    buckets: u32,
}

#[derive(Debug, Deserialize)]
pub struct AnalyticsQuery {
    from: u64,
    to: u64,
}

// Admin middleware to check if user is an admin
pub async fn admin_middleware(
    DeviceId(device_id): DeviceId,
    State(app_state): State<SharedAppState>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Get email for this device
    let email = app_state
        .database
        .get_email_by_device(&device_id)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to get email for device: {:?}", e))?
        .ok_or_else(|| anyhow::anyhow!("Device not associated with any user"))?;

    // Check if email is in admin list
    if !app_state.config.admin_emails.contains(&email) {
        return Ok(error_response("admin_only"));
    }

    Ok(next.run(request).await)
}

pub fn create_admin_router() -> Router<SharedAppState> {
    Router::new()
        .route("/bucket/{table}", get(bucket_handler))
        .route("/analytics", get(analytics_handler))
}

async fn bucket_handler(
    Path(table): Path<String>,
    Query(query): Query<BucketQuery>,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    // Validate table name
    if table != "hits" && table != "events" && table != "users" {
        return Ok(error_response("not_allowed"));
    }

    // Validate query parameters
    if query.from >= query.to {
        return Err(anyhow::anyhow!("Invalid time range: from must be less than to").into());
    }

    if query.buckets == 0 {
        return Err(anyhow::anyhow!("Invalid buckets: must be greater than 0").into());
    }

    let start = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| anyhow::anyhow!("Failed to get current time: {:?}", e))?
        .as_millis();

    let increment_size = (query.to - query.from) / query.buckets as u64;
    let mut buckets: HashMap<u64, u32> = HashMap::new();

    // Get all timestamps in the range
    let timestamps = app_state
        .database
        .get_timestamps_for_table(&table, query.from, query.to)
        .await?;

    // Create buckets
    let mut key = query.from;
    let mut next_key = query.from + increment_size;
    let mut i = 0;

    while key <= query.to {
        buckets.insert(key, 0);

        // Count items in this bucket
        while i < timestamps.len() && timestamps[i] < next_key {
            *buckets.get_mut(&key).unwrap() += 1;
            i += 1;
        }

        key += increment_size;
        next_key += increment_size;
    }

    let analysis_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| anyhow::anyhow!("Failed to get current time: {:?}", e))?
        .as_millis()
        - start;

    let response = json!({
        "analysis_time": analysis_time,
        "buckets": buckets,
        "table": table
    });

    Ok(success_response(response))
}

async fn analytics_handler(
    Query(query): Query<AnalyticsQuery>,
    State(app_state): State<SharedAppState>,
) -> Result<Response, AppError> {
    let start = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| anyhow::anyhow!("Failed to get current time: {:?}", e))?
        .as_millis();

    let from = query.from;
    let to = query.to;

    // Validate query parameters
    if from >= to {
        return Err(anyhow::anyhow!("Invalid time range: from must be less than to").into());
    }

    // Build the complex analytics response using dynamic JSON
    let mut data = json!({
        "hits": {},
        "devices": {},
        "errors": {},
        "events": {},
        "users": {},
        "totals": {
            "devices": {},
            "users": {}
        }
    });

    // === HITS ANALYTICS ===
    let hits_count = app_state.database.get_hits_count(from, to).await?;
    data["hits"]["count"] = json!(hits_count);

    let hits_from_users = app_state
        .database
        .get_hits_from_users_count(from, to)
        .await?;
    data["hits"]["hits_from_users"] = json!(hits_from_users);

    data["hits"]["version"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "version", 10, from, to)
            .await?
    );
    data["hits"]["ip"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "ip", 20, from, to)
            .await?
    );
    data["hits"]["pathname"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "pathname", 10, from, to)
            .await?
    );
    data["hits"]["referrer"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "referrer", 10, from, to)
            .await?
    );
    data["hits"]["school"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "school", 20, from, to)
            .await?
    );
    data["hits"]["period"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "period", 30, from, to)
            .await?
    );
    data["hits"]["user_theme"] = json!(
        app_state
            .database
            .col_popular::<u8>("hits", "user_theme", 10, from, to)
            .await?
    );
    data["hits"]["user_period"] = json!(
        app_state
            .database
            .col_popular::<String>("hits", "user_period", 10, from, to)
            .await?
    );

    data["hits"]["dc"] = json!(app_state.database.col_stats("hits", "dc", from, to).await?);
    data["hits"]["pc"] = json!(app_state.database.col_stats("hits", "pc", from, to).await?);
    data["hits"]["rt"] = json!(app_state.database.col_stats("hits", "rt", from, to).await?);
    data["hits"]["dns"] = json!(
        app_state
            .database
            .col_stats("hits", "dns", from, to)
            .await?
    );
    data["hits"]["tti"] = json!(
        app_state
            .database
            .col_stats("hits", "tti", from, to)
            .await?
    );
    data["hits"]["ttfb"] = json!(
        app_state
            .database
            .col_stats("hits", "ttfb", from, to)
            .await?
    );

    let unique_devices = app_state
        .database
        .get_unique_devices_count(from, to)
        .await?;
    data["hits"]["unique_devices"] = json!(unique_devices);

    let unique_users = app_state
        .database
        .get_unique_users_in_hits(from, to)
        .await?;
    data["hits"]["unique_users"] = json!(unique_users);

    let top_devices = app_state.database.get_top_devices_in_hits(from, to).await?;
    data["hits"]["top_devices"] = json!(top_devices);

    // === DEVICES ANALYTICS ===
    let devices_count = app_state.database.get_devices_count(from, to).await?;
    data["devices"]["count"] = json!(devices_count);

    let devices_registered_count = app_state
        .database
        .get_devices_registered_count(from, to)
        .await?;
    data["devices"]["count_registered"] = json!(devices_registered_count);

    data["devices"]["platform"] = json!(
        app_state
            .database
            .col_popular::<String>("devices", "platform", 18, from, to)
            .await?
    );
    data["devices"]["browser"] = json!(
        app_state
            .database
            .col_popular::<String>("devices", "browser", 18, from, to)
            .await?
    );

    // === ERRORS ANALYTICS ===
    let errors = app_state.database.get_errors_in_range(from, to).await?;
    data["errors"] = json!(errors);

    // === EVENTS ANALYTICS ===
    let events_count = app_state.database.get_events_count(from, to).await?;
    data["events"]["count"] = json!(events_count);

    let upt_pref_count = app_state
        .database
        .get_events_count_by_type("upt_pref", from, to)
        .await?;
    data["events"]["upt_pref"] = json!(upt_pref_count);

    let notif_on_count = app_state
        .database
        .get_events_count_by_type("notif_on", from, to)
        .await?;
    data["events"]["notif_on"] = json!(notif_on_count);

    // === USERS ANALYTICS ===
    let users_list = app_state.database.get_users_in_range(from, to).await?;
    data["users"]["list"] = json!(users_list);

    data["users"]["theme"] = json!(
        app_state
            .database
            .col_popular::<u8>("users", "theme", 18, from, to)
            .await?
    );
    data["users"]["school"] = json!(
        app_state
            .database
            .col_popular::<String>("users", "school", 18, from, to)
            .await?
    );

    // === TOTALS ===
    let total_hits = app_state.database.get_total_hits_count().await?;
    data["totals"]["hits"] = json!(total_hits);

    let total_devices_count = app_state.database.get_total_devices_count().await?;
    data["totals"]["devices"]["count"] = json!(total_devices_count);

    let total_devices_registered = app_state
        .database
        .get_total_devices_registered_count()
        .await?;
    data["totals"]["devices"]["registered"] = json!(total_devices_registered);

    data["totals"]["devices"]["platform"] = json!(
        app_state
            .database
            .get_total_devices_platform_stats()
            .await?
    );
    data["totals"]["devices"]["browser"] =
        json!(app_state.database.get_total_devices_browser_stats().await?);

    let total_errors = app_state.database.get_total_errors_count().await?;
    data["totals"]["errors"] = json!(total_errors);

    let total_events = app_state.database.get_total_events_count().await?;
    data["totals"]["events"] = json!(total_events);

    let total_users_count = app_state.database.get_total_users_count().await?;
    data["totals"]["users"]["count"] = json!(total_users_count);

    data["totals"]["users"]["theme"] =
        json!(app_state.database.get_total_users_theme_stats().await?);
    data["totals"]["users"]["school"] =
        json!(app_state.database.get_total_users_school_stats().await?);

    let analysis_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| anyhow::anyhow!("Failed to get current time: {:?}", e))?
        .as_millis()
        - start;

    data["analysis_time"] = json!(analysis_time);

    Ok(success_response(data))
}
