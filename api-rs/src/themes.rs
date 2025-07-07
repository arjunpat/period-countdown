use serde_json::json;
use serde_json::Value;

pub fn get_themes() -> Value {
    json!([
        {
            "n": "Yellow",
            "b": "linear-gradient(90deg, #fccb0b, #fc590b)",
            "c": "rgba(0,0,0,0.1)",
            "t": "#000"
        },
        {
            "n": "Beach",
            "b": "linear-gradient(45deg, #d53369, #cbad6d)",
            "c": "rgba(255,255,255,0.1)",
            "t": "#fff"
        },
        {
            "n": "Blue",
            "b": "linear-gradient(45deg, #2980b9, #2c3e50)",
            "c": "rgba(255,255,255,0.1)",
            "t": "#fff"
        },
        {
            "n": "Cotton Candy",
            "b": "linear-gradient(45deg, #ACB6E5, #74ebd5)",
            "c": "rgba(0,0,0,0.1)",
            "t": "#000"
        },
        {
            "n": "Pink",
            "b": "linear-gradient(45deg, #FC5C7D, #6A82FB)",
            "c": "rgba(0,0,0,0.1)",
            "t": "#000"
        },
        {
            "n": "Instagram",
            "b": "linear-gradient(45deg, #fcb045, #fd1d1d, #833ab4)",
            "c": "rgba(255,255,255,0.1)",
            "t": "#fff"
        },
        {
            "n": "Twitch",
            "b": "linear-gradient(45deg, #6441A5, #2a0845)",
            "c": "rgba(255,255,255,0.1)",
            "t": "#ddd"
        },
        {
            "n": "Purple",
            "b": "linear-gradient(45deg, #fffcdc, #d9a7c7)",
            "c": "rgba(0,0,0,0.1)",
            "t": "#000"
        },
        {
            "n": "Peach",
            "b": "linear-gradient(45deg, #fffbd5, #b20a2c)",
            "c": "rgba(0,0,0,0.1)",
            "t": "#000"
        },
        {
            "n": "Netflix",
            "b": "linear-gradient(45deg, #8e0e00, #1f1c18)",
            "c": "rgba(255,255,255,0.1)",
            "t": "#ddd"
        }
    ])
}