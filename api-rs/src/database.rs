use chrono::Utc;
use rand::Rng;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Row, migrate::MigrateError, mysql::MySqlPool};
use std::env;

// Database structs matching the Node.js schema
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Device {
    pub device_id: String,
    pub time: i64,
    pub platform: Option<String>,
    pub browser: Option<String>,
    pub user_agent: Option<String>,
    pub registered_to: Option<String>,
    pub time_registered: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub email: String,
    pub time: i64,
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
    pub time: i64,
    pub device_id: Option<String>,
    pub leave_time: Option<i64>,
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
    pub time: i64,
    pub device_id: Option<String>,
    pub error: Option<String>,
}

// Database connection pool
pub struct Database {
    pool: MySqlPool,
}

impl Database {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let database_url = format!(
            "mysql://{}:{}@{}/{}",
            env::var("MYSQL_USER").unwrap_or_else(|_| "root".to_string()),
            env::var("MYSQL_PASS").unwrap_or_else(|_| "".to_string()),
            env::var("MYSQL_HOST").unwrap_or_else(|_| "localhost".to_string()),
            env::var("MYSQL_DB").unwrap_or_else(|_| "period_countdown".to_string())
        );

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
        let time = chrono::Utc::now().timestamp_millis();

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
}
