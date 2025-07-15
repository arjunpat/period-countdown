use chrono::Utc;
use rand::Rng;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Row, migrate::MigrateError, mysql::MySqlPool};

use crate::config::AppConfig;

// Database structs matching the Node.js schema
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Device {
    pub device_id: String,
    pub time: u64,
    pub platform: Option<String>,
    pub browser: Option<String>,
    pub user_agent: Option<String>,
    pub registered_to: Option<String>,
    pub time_registered: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub email: String,
    pub time: u64,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub profile_pic: Option<String>,
    pub school: Option<String>,
    pub theme: Option<u8>,
    pub period_names: Option<Value>,
    pub rooms: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Hit {
    pub time: u64,
    pub device_id: Option<String>,
    pub leave_time: Option<u64>,
    pub ip: Option<String>,
    pub pathname: Option<String>,
    pub referrer: Option<String>,
    pub version: Option<String>,
    pub school: Option<String>,
    pub period: Option<String>,
    pub dc: Option<u16>,
    pub pc: Option<u16>,
    pub rt: Option<u16>,
    pub dns: Option<u16>,
    pub tti: Option<u16>,
    pub ttfb: Option<u16>,
    pub user_theme: Option<u8>,
    pub user_period: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Event {
    pub time: i64,
    pub email: Option<String>,
    pub event: Option<String>,
    pub item_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Error {
    pub db_id: Option<u16>,
    pub time: u64,
    pub device_id: Option<String>,
    pub error: Option<String>,
}

// Database connection pool
pub struct Database {
    pool: MySqlPool,
}

impl Database {
    pub async fn new(config: &AppConfig) -> Result<Self, sqlx::Error> {
        let database_url = config.database_url();
        let pool = MySqlPool::connect(&database_url).await?;
        Ok(Database { pool })
    }

    pub async fn run_migrations(&self) -> Result<(), MigrateError> {
        // This will be implemented when we create the migrations
        sqlx::migrate!("./migrations").run(&self.pool).await
    }

    pub fn get_pool(&self) -> &MySqlPool {
        &self.pool
    }
}

// ID generation helper matching Node.js implementation
pub fn generate_id(length: usize) -> String {
    const CHARS: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let mut rng = rand::thread_rng();

    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARS.len());
            CHARS[idx] as char
        })
        .collect()
}

// Database operations
impl Database {
    // Device operations
    pub async fn create_device(
        &self,
        platform: Option<String>,
        browser: Option<String>,
        user_agent: Option<String>,
    ) -> Result<String, sqlx::Error> {
        let device_id = generate_id(10);
        let time = chrono::Utc::now().timestamp_millis() as u64;

        sqlx::query(
            "INSERT INTO devices (device_id, time, platform, browser, user_agent) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(&device_id)
        .bind(time)
        .bind(&platform)
        .bind(&browser)
        .bind(&user_agent)
        .execute(&self.pool)
        .await?;

        Ok(device_id)
    }

    pub async fn device_exists(&self, device_id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("SELECT device_id FROM devices WHERE device_id = ?")
            .bind(device_id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(result.is_some())
    }

    pub async fn login_device(&self, device_id: &str, email: &str) -> Result<(), sqlx::Error> {
        let time_registered = chrono::Utc::now().timestamp_millis();

        sqlx::query(
            "UPDATE devices SET registered_to = ?, time_registered = ? WHERE device_id = ?",
        )
        .bind(email)
        .bind(time_registered)
        .bind(device_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn logout_device(&self, device_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE devices SET registered_to = NULL, time_registered = NULL WHERE device_id = ?",
        )
        .bind(device_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_email_by_device(
        &self,
        device_id: &str,
    ) -> Result<Option<String>, sqlx::Error> {
        let result = sqlx::query("SELECT registered_to FROM devices WHERE device_id = ?")
            .bind(device_id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(result.and_then(|row| {
            row.try_get::<Option<String>, _>("registered_to")
                .ok()
                .flatten()
        }))
    }

    // User operations
    pub async fn get_user_by_device(&self, device_id: &str) -> Result<Option<User>, sqlx::Error> {
        let result = sqlx::query_as::<_, User>(
            "SELECT u.* FROM users u 
             JOIN devices d ON u.email = d.registered_to 
             WHERE d.device_id = ?",
        )
        .bind(device_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn create_or_update_user(
        &self,
        email: &str,
        first_name: Option<String>,
        last_name: Option<String>,
        profile_pic: Option<String>,
    ) -> Result<(), sqlx::Error> {
        let time = chrono::Utc::now().timestamp_millis();

        sqlx::query(
            "INSERT INTO users (email, time, first_name, last_name, profile_pic) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             first_name = VALUES(first_name), 
             last_name = VALUES(last_name), 
             profile_pic = VALUES(profile_pic)",
        )
        .bind(email)
        .bind(time)
        .bind(&first_name)
        .bind(&last_name)
        .bind(&profile_pic)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_user_preferences(
        &self,
        device_id: &str,
        school: Option<String>,
        theme: Option<u8>,
        period_names: Option<Value>,
        rooms: Option<Value>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE users u 
             JOIN devices d ON u.email = d.registered_to 
             SET u.school = ?, u.theme = ?, u.period_names = ?, u.rooms = ? 
             WHERE d.device_id = ?",
        )
        .bind(&school)
        .bind(&theme)
        .bind(&period_names)
        .bind(&rooms)
        .bind(device_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_user_preferences_and_get_email(
        &self,
        device_id: &str,
        school: Option<String>,
        theme: Option<u8>,
        period_names: Option<Value>,
        rooms: Option<Value>,
    ) -> Result<Option<String>, sqlx::Error> {
        let result = sqlx::query(
            "UPDATE users u 
             JOIN devices d ON u.email = d.registered_to 
             SET u.school = ?, u.theme = ?, u.period_names = ?, u.rooms = ? 
             WHERE d.device_id = ?",
        )
        .bind(&school)
        .bind(&theme)
        .bind(&period_names)
        .bind(&rooms)
        .bind(device_id)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() > 0 {
            self.get_email_by_device(device_id).await
        } else {
            Ok(None)
        }
    }

    // Hit operations
    pub async fn create_hit(&self, hit_data: Hit) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO hits (time, device_id, ip, pathname, referrer, version, school, period, dc, pc, rt, dns, tti, ttfb, user_theme, user_period) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(hit_data.time)
        .bind(&hit_data.device_id)
        .bind(&hit_data.ip)
        .bind(&hit_data.pathname)
        .bind(&hit_data.referrer)
        .bind(&hit_data.version)
        .bind(&hit_data.school)
        .bind(&hit_data.period)
        .bind(&hit_data.dc)
        .bind(&hit_data.pc)
        .bind(&hit_data.rt)
        .bind(&hit_data.dns)
        .bind(&hit_data.tti)
        .bind(&hit_data.ttfb)
        .bind(&hit_data.user_theme)
        .bind(&hit_data.user_period)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_hit_leave_time(&self, device_id: &str) -> Result<(), sqlx::Error> {
        let leave_time = chrono::Utc::now().timestamp_millis();

        sqlx::query(
            "UPDATE hits SET leave_time = ? WHERE device_id = ? ORDER BY time DESC LIMIT 1",
        )
        .bind(leave_time)
        .bind(device_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Event operations
    pub async fn record_upt_pref(&self, email: &str, device_id: &str) -> Result<(), sqlx::Error> {
        let now = Utc::now().timestamp_millis();

        sqlx::query("DELETE FROM events WHERE time > ? AND email = ? AND event = ?")
            .bind(now - 300000)
            .bind(email)
            .bind("upt_pref")
            .execute(&self.pool)
            .await?;

        sqlx::query("INSERT INTO events (time, email, event, item_id) VALUES (?, ?, ?, ?)")
            .bind(now)
            .bind(email)
            .bind("upt_pref")
            .bind(device_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn notif_on(&self, device_id: &str) -> Result<bool, sqlx::Error> {
        let result =
            sqlx::query("SELECT event FROM events WHERE event = 'notif_on' AND item_id = ?")
                .bind(device_id)
                .fetch_optional(&self.pool)
                .await?;

        if result.is_some() {
            return Ok(false);
        }

        let now = Utc::now().timestamp_millis();

        sqlx::query("INSERT INTO events (time, event, item_id) VALUES (?, ?, ?)")
            .bind(now)
            .bind("notif_on")
            .bind(device_id)
            .execute(&self.pool)
            .await?;

        Ok(true)
    }

    // Error operations
    pub async fn create_error(
        &self,
        device_id: Option<String>,
        error: Option<String>,
    ) -> Result<(), sqlx::Error> {
        let time = chrono::Utc::now().timestamp_millis();

        sqlx::query("INSERT INTO errors (time, device_id, error) VALUES (?, ?, ?)")
            .bind(time)
            .bind(&device_id)
            .bind(&error)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    // Analytics operations for admin routes

    // Get timestamps for bucketing
    pub async fn get_timestamps_for_table(
        &self,
        table: &str,
        from: u64,
        to: u64,
    ) -> Result<Vec<u64>, sqlx::Error> {
        let query_str = format!(
            "SELECT time FROM {} WHERE time > ? AND time < ? ORDER BY time ASC",
            table
        );
        let rows = sqlx::query(&query_str)
            .bind(from)
            .bind(to)
            .fetch_all(&self.pool)
            .await?;

        let timestamps: Result<Vec<u64>, sqlx::Error> = rows
            .into_iter()
            .map(|row| row.try_get::<u64, _>("time"))
            .collect();
        let timestamps = timestamps?;

        Ok(timestamps)
    }

    // Column statistics helper
    pub async fn col_stats(
        &self,
        table: &str,
        column: &str,
        from: u64,
        to: u64,
    ) -> Result<Value, sqlx::Error> {
        let query_str = format!(
            "SELECT MAX({}) AS max, MIN({}) AS min, CAST(AVG({}) AS DOUBLE) AS avg, CAST(STD({}) AS DOUBLE) as std FROM {} WHERE time > ? AND time < ?",
            column, column, column, column, table
        );

        let row = sqlx::query(&query_str)
            .bind(from)
            .bind(to)
            .fetch_one(&self.pool)
            .await?;

        let max: Option<u16> = row.try_get("max")?;
        let min: Option<u16> = row.try_get("min")?;
        let avg: Option<f64> = row.try_get("avg")?;
        let std: Option<f64> = row.try_get("std")?;

        Ok(serde_json::json!({
            "max": max,
            "min": min,
            "avg": avg,
            "std": std
        }))
    }

    // Generic popular column values helper
    pub async fn col_popular<T>(
        &self,
        table: &str,
        column: &str,
        limit: u32,
        from: u64,
        to: u64,
    ) -> Result<Vec<Value>, sqlx::Error>
    where
        T: for<'r> sqlx::Decode<'r, sqlx::MySql> + sqlx::Type<sqlx::MySql> + serde::Serialize,
    {
        let query_str = format!(
            "SELECT {} as value, COUNT(*) AS count FROM {} WHERE time > ? AND time < ? GROUP BY value ORDER BY count DESC LIMIT {}",
            column, table, limit
        );

        let rows = sqlx::query(&query_str)
            .bind(from)
            .bind(to)
            .fetch_all(&self.pool)
            .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                let count: i64 = row.try_get("count")?;
                let value: Option<T> = row.try_get("value")?;

                Ok(serde_json::json!({
                    "value": value,
                    "count": count
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }

    // Hits analytics
    pub async fn get_hits_count(&self, from: u64, to: u64) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM hits WHERE time > ? AND time < ?")
            .bind(from)
            .bind(to)
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_hits_from_users_count(&self, from: u64, to: u64) -> Result<i64, sqlx::Error> {
        let row = sqlx::query(
            "SELECT COUNT(*) as count FROM hits WHERE time > ? AND time < ? AND device_id IN (SELECT device_id FROM devices WHERE registered_to IS NOT NULL)"
        )
        .bind(from)
        .bind(to)
        .fetch_one(&self.pool)
        .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_unique_devices_count(&self, from: u64, to: u64) -> Result<i64, sqlx::Error> {
        let row = sqlx::query(
            "SELECT COUNT(DISTINCT device_id) as count FROM hits WHERE time > ? AND time < ?",
        )
        .bind(from)
        .bind(to)
        .fetch_one(&self.pool)
        .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_unique_users_in_hits(
        &self,
        from: u64,
        to: u64,
    ) -> Result<Vec<User>, sqlx::Error> {
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email IN (SELECT registered_to FROM devices WHERE device_id IN (SELECT device_id FROM hits WHERE time > ? AND time < ?))"
        )
        .bind(from)
        .bind(to)
        .fetch_all(&self.pool)
        .await?;

        Ok(users)
    }

    pub async fn get_top_devices_in_hits(
        &self,
        from: u64,
        to: u64,
    ) -> Result<Vec<Value>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT a.device_id, b.platform, b.browser, COUNT(a.device_id) as count, b.first_name, b.last_name, b.registered_to 
             FROM hits a LEFT JOIN (
                 SELECT c.device_id, c.registered_to, c.platform, c.browser, d.first_name, d.last_name 
                 FROM devices c LEFT JOIN users d ON c.registered_to = d.email
             ) b ON a.device_id = b.device_id 
             WHERE time > ? AND time < ? 
             GROUP BY a.device_id 
             ORDER BY count DESC LIMIT 10"
        )
        .bind(from)
        .bind(to)
        .fetch_all(&self.pool)
        .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                Ok(serde_json::json!({
                    "device_id": row.try_get::<Option<String>, _>("device_id")?,
                    "platform": row.try_get::<Option<String>, _>("platform")?,
                    "browser": row.try_get::<Option<String>, _>("browser")?,
                    "count": row.try_get::<i64, _>("count")?,
                    "first_name": row.try_get::<Option<String>, _>("first_name")?,
                    "last_name": row.try_get::<Option<String>, _>("last_name")?,
                    "registered_to": row.try_get::<Option<String>, _>("registered_to")?
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }

    // Devices analytics
    pub async fn get_devices_count(&self, from: u64, to: u64) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM devices WHERE time > ? AND time < ?")
            .bind(from)
            .bind(to)
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_devices_registered_count(
        &self,
        from: u64,
        to: u64,
    ) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM devices WHERE time_registered > ? AND time_registered < ?")
            .bind(from)
            .bind(to)
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    // Errors analytics
    pub async fn get_errors_in_range(&self, from: u64, to: u64) -> Result<Vec<Error>, sqlx::Error> {
        let errors = sqlx::query_as::<_, Error>("SELECT * FROM errors WHERE time > ? AND time < ?")
            .bind(from)
            .bind(to)
            .fetch_all(&self.pool)
            .await?;

        Ok(errors)
    }

    // Events analytics
    pub async fn get_events_count(&self, from: u64, to: u64) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM events WHERE time > ? AND time < ?")
            .bind(from)
            .bind(to)
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_events_count_by_type(
        &self,
        event_type: &str,
        from: u64,
        to: u64,
    ) -> Result<i64, sqlx::Error> {
        let row = sqlx::query(
            "SELECT COUNT(*) as count FROM events WHERE event = ? AND time > ? AND time < ?",
        )
        .bind(event_type)
        .bind(from)
        .bind(to)
        .fetch_one(&self.pool)
        .await?;

        Ok(row.try_get("count")?)
    }

    // Users analytics
    pub async fn get_users_in_range(&self, from: u64, to: u64) -> Result<Vec<User>, sqlx::Error> {
        let users = sqlx::query_as::<_, User>("SELECT * FROM users WHERE time > ? AND time < ?")
            .bind(from)
            .bind(to)
            .fetch_all(&self.pool)
            .await?;

        Ok(users)
    }

    // Total statistics (no time range)
    pub async fn get_total_hits_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM hits")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_devices_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM devices")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_devices_registered_count(&self) -> Result<i64, sqlx::Error> {
        let row =
            sqlx::query("SELECT COUNT(*) as count FROM devices WHERE registered_to IS NOT NULL")
                .fetch_one(&self.pool)
                .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_devices_platform_stats(&self) -> Result<Vec<Value>, sqlx::Error> {
        let rows = sqlx::query("SELECT platform as value, COUNT(*) AS count FROM devices GROUP BY value ORDER BY count DESC LIMIT 18")
            .fetch_all(&self.pool)
            .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                let count: i64 = row.try_get("count")?;

                let value: Option<String> = row.try_get("value")?;
                let value = match value {
                    Some(v) => serde_json::Value::String(v),
                    None => serde_json::Value::Null,
                };

                Ok(serde_json::json!({
                    "value": value,
                    "count": count
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }

    pub async fn get_total_devices_browser_stats(&self) -> Result<Vec<Value>, sqlx::Error> {
        let rows = sqlx::query("SELECT browser as value, COUNT(*) AS count FROM devices GROUP BY value ORDER BY count DESC LIMIT 18")
            .fetch_all(&self.pool)
            .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                let count: i64 = row.try_get("count")?;

                let value: Option<String> = row.try_get("value")?;
                let value = match value {
                    Some(v) => serde_json::Value::String(v),
                    None => serde_json::Value::Null,
                };

                Ok(serde_json::json!({
                    "value": value,
                    "count": count
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }

    pub async fn get_total_errors_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM errors")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_events_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM events")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_users_count(&self) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM users")
            .fetch_one(&self.pool)
            .await?;

        Ok(row.try_get("count")?)
    }

    pub async fn get_total_users_theme_stats(&self) -> Result<Vec<Value>, sqlx::Error> {
        let rows = sqlx::query("SELECT theme as value, COUNT(*) AS count FROM users GROUP BY value ORDER BY count DESC LIMIT 18")
            .fetch_all(&self.pool)
            .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                let count: i64 = row.try_get("count")?;

                let value: Option<u8> = row.try_get("value")?;
                let value = match value {
                    Some(v) => serde_json::Value::Number(v.into()),
                    None => serde_json::Value::Null,
                };

                Ok(serde_json::json!({
                    "value": value,
                    "count": count
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }

    pub async fn get_total_users_school_stats(&self) -> Result<Vec<Value>, sqlx::Error> {
        let rows = sqlx::query("SELECT school as value, COUNT(*) AS count FROM users GROUP BY value ORDER BY count DESC LIMIT 18")
            .fetch_all(&self.pool)
            .await?;

        let results: Result<Vec<Value>, sqlx::Error> = rows
            .into_iter()
            .map(|row| {
                let count: i64 = row.try_get("count")?;

                let value: Option<String> = row.try_get("value")?;
                let value = match value {
                    Some(v) => serde_json::Value::String(v),
                    None => serde_json::Value::Null,
                };

                Ok(serde_json::json!({
                    "value": value,
                    "count": count
                }))
            })
            .collect();
        let results = results?;

        Ok(results)
    }
}
