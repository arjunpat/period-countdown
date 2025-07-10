use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

// Request types
#[derive(Debug, Deserialize)]
pub struct InitRequest {
    pub user_agent: String,
    pub platform: String,
    pub browser: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub google_token: String,
}

#[derive(Debug, Deserialize)]
pub struct ThanksRequest {
    pub pathname: String,
    pub referrer: String,
    pub school: String,
    pub version: String,
    pub period: String,
    pub dns: u32,
    pub dc: u32,
    pub pc: u32,
    pub rt: u32,
    pub ttfb: u32,
    pub tti: u32,
    pub user_theme: Option<u8>,
    pub user_period: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePreferencesRequest {
    pub period_names: HashMap<String, String>,
    pub rooms: HashMap<String, RoomData>,
    pub theme: u8,
    pub school: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RoomData {
    pub r#type: String,
    pub url: String,
}

// Response types
#[derive(Debug, Serialize)]
pub struct AccountResponse {
    pub email: String,
    pub profile_pic: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub theme: ThemeResponse,
    pub admin: Option<bool>,
    pub school: String,
    pub period_names: HashMap<String, String>,
    pub rooms: HashMap<String, RoomData>,
}

#[derive(Debug, Serialize)]
pub struct ThemeResponse {
    pub theme: u8,
    #[serde(flatten)]
    pub theme_data: Value,
}

// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub device_id: String,
}

// Google OAuth response
#[derive(Debug, Deserialize)]
pub struct GoogleTokenInfo {
    pub email: String,
    pub given_name: String,
    pub family_name: String,
    pub picture: String,
    pub email_verified: bool,
}

// Cookie configuration
#[derive(Debug, Clone)]
pub struct CookieConfig {
    pub domain: Option<String>,
    pub max_age: i64,
    pub same_site: Option<String>,
    pub secure: bool,
}

impl CookieConfig {
    pub fn new(is_production: bool) -> Self {
        Self {
            domain: if is_production {
                Some(".periods.io".to_string())
            } else {
                None
            },
            max_age: 473_000_000_000, // 4.73e11 milliseconds
            same_site: if is_production {
                Some("none".to_string())
            } else {
                None
            },
            secure: is_production,
        }
    }
}

// Validation helpers
impl ThanksRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.pathname.is_empty() {
            return Err("pathname is required".to_string());
        }
        if self.referrer.is_empty() {
            return Err("referrer is required".to_string());
        }
        if self.school.is_empty() {
            return Err("school is required".to_string());
        }
        if self.version.is_empty() {
            return Err("version is required".to_string());
        }
        if self.period.is_empty() {
            return Err("period is required".to_string());
        }
        Ok(())
    }
}

impl UpdatePreferencesRequest {
    pub fn validate(&self, valid_schools: &[String]) -> Result<(), String> {
        if self.theme > 40 {
            return Err("theme must be <= 40".to_string());
        }

        if !valid_schools.contains(&self.school) {
            return Err("invalid school".to_string());
        }

        if self.period_names.len() > 20 {
            return Err("too many period names".to_string());
        }

        for (key, value) in &self.period_names {
            if key.len() > 40 || value.len() > 40 {
                return Err("period name or value too long".to_string());
            }
        }

        for (key, room) in &self.rooms {
            if key.len() >= 40 {
                return Err("room key too long".to_string());
            }
            if room.r#type != "url" {
                return Err("invalid room type".to_string());
            }
        }

        Ok(())
    }

    pub fn sanitize_rooms(&self) -> HashMap<String, RoomData> {
        let mut good_rooms = HashMap::new();

        for (key, room) in &self.rooms {
            if key.len() < 40 && room.r#type == "url" {
                good_rooms.insert(
                    key.clone(),
                    RoomData {
                        r#type: "url".to_string(),
                        url: room.url.clone(),
                    },
                );
            }
        }

        good_rooms
    }
}
