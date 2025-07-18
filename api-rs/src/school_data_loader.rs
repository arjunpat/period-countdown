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
const DATA_DIRECTORY: &str = "data";

pub struct SchoolDataLoader {
    cache: Arc<RwLock<HashMap<String, CacheEntry>>>,
}

impl SchoolDataLoader {
    pub async fn new() -> anyhow::Result<Self> {
        // Check if data directory exists
        if !tokio::fs::metadata(DATA_DIRECTORY).await.is_ok() {
            return Err(anyhow::anyhow!(
                "Data directory '{}' not found",
                DATA_DIRECTORY
            ));
        }

        Ok(Self {
            cache: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    // Helper method to get cached or fresh data
    async fn get_cached_data(&self, relative_path: &str) -> Result<Value, String> {
        // First check cache with read lock
        {
            let cache = self.cache.read().await;
            if let Some(entry) = cache.get(relative_path) {
                if entry.timestamp.elapsed() < CACHE_TTL {
                    return Ok(entry.data.clone());
                }
            }
        }

        // Cache miss or expired, read from file
        let full_path = format!("{}/{}", DATA_DIRECTORY, relative_path);
        match tokio::fs::read_to_string(&full_path).await {
            Ok(content) => match serde_json::from_str::<Value>(&content) {
                Ok(data) => {
                    // Update cache with write lock (using relative path as key)
                    let mut cache = self.cache.write().await;
                    cache.insert(
                        relative_path.to_string(),
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

        let relative_path = format!("{}/school.json", school);
        self.get_cached_data(&relative_path).await
    }

    pub async fn get_schedule_data(&self, school: &str) -> Result<Value, String> {
        if !self.is_valid_school(school).await {
            return Err("missing_school".to_string());
        }

        let relative_path = format!("{}/schedule.json", school);
        self.get_cached_data(&relative_path).await
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
        self.get_cached_data("school_directory.json").await
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
