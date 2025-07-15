use crate::types::GoogleTokenInfo;
use reqwest::Client;
use serde_json::Value;

pub async fn validate_google_token(
    token: &str,
) -> Result<GoogleTokenInfo, Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::new();
    let url = format!(
        "https://www.googleapis.com/oauth2/v3/userinfo?access_token={}",
        token
    );

    let response = client.get(&url).send().await?;

    if !response.status().is_success() {
        return Err("Invalid Google token".into());
    }

    let token_info: Value = response.json().await?;

    println!("{:#?}", token_info);

    // Validate required fields exist
    let email = token_info
        .get("email")
        .and_then(|v| v.as_str())
        .ok_or("Missing email in token")?;

    let given_name = token_info
        .get("given_name")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let family_name = token_info
        .get("family_name")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let picture = token_info
        .get("picture")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let email_verified = token_info
        .get("email_verified")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    // Ensure email is verified
    if !email_verified {
        return Err("Email not verified".into());
    }

    Ok(GoogleTokenInfo {
        email: email.to_string(),
        given_name,
        family_name,
        picture,
        email_verified,
    })
}
