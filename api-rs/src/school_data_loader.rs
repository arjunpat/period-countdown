use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

#[derive(Clone)]
struct CacheEntry {
    data: Value,
    timestamp: Instant,
}

const CACHE_TTL: Duration = Duration::from_secs(60); // 1 minute

pub struct SchoolDataLoader {
    cache: Arc<RwLock<HashMap<String, CacheEntry>>>,
}

impl SchoolDataLoader {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    // Helper method to get cached or fresh data
    async fn get_cached_data(&self, file_path: &str) -> Result<Value, String> {
        // First check cache with read lock
        {
            let cache = self.cache.read().await;
            if let Some(entry) = cache.get(file_path) {
                if entry.timestamp.elapsed() < CACHE_TTL {
                    return Ok(entry.data.clone());
                }
            }
        }

        // Cache miss or expired, read from file
        match tokio::fs::read_to_string(file_path).await {
            Ok(content) => match serde_json::from_str::<Value>(&content) {
                Ok(data) => {
                    // Update cache with write lock
                    let mut cache = self.cache.write().await;
                    cache.insert(
                        file_path.to_string(),
                        CacheEntry {
                            data: data.clone(),
                            timestamp: Instant::now(),
                        },
                    );
                    Ok(data)
                }
                Err(_) => Err("invalid_json".to_string()),
            },
            Err(_) => Err("file_not_found".to_string()),
        }
    }

    // Public API methods
    pub async fn get_school_data(&self, school: &str) -> Result<Value, String> {
        if !self.is_valid_school(school).await {
            return Err("missing_school".to_string());
        }

        let file_path = format!("data/{}/school.json", school);
        self.get_cached_data(&file_path).await
    }

    pub async fn get_schedule_data(&self, school: &str) -> Result<Value, String> {
        if !self.is_valid_school(school).await {
            return Err("missing_school".to_string());
        }

        let file_path = format!("data/{}/schedule.json", school);
        self.get_cached_data(&file_path).await
    }

    pub async fn get_periods_data(&self, school: &str) -> Result<Value, String> {
        match self.get_school_data(school).await {
            Ok(school_data) => {
                if let Some(periods) = school_data.get("periods") {
                    Ok(periods.clone())
                } else {
                    Err("missing_periods".to_string())
                }
            }
            Err(error) => Err(error),
        }
    }

    pub async fn get_schools_directory(&self) -> Result<Value, String> {
        self.get_cached_data("data/school_directory.json").await
    }

    pub async fn is_valid_school(&self, school: &str) -> bool {
        match self.get_schools_directory().await {
            Ok(directory) => {
                if let Some(schools) = directory.as_array() {
                    schools
                        .iter()
                        .any(|s| s.get("id").and_then(|id| id.as_str()) == Some(school))
                } else {
                    false
                }
            }
            Err(_) => false,
        }
    }
}