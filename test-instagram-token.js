"use strict";

// This script tests an Instagram Graph API access token
// Usage: node test-instagram-token.js YOUR_TOKEN

const token = process.argv[2] || process.env.META_ACCESS_TOKEN;

if (!token) {
    console.error("No token provided. Run with: node test-instagram-token.js YOUR_TOKEN");
    process.exit(1);
}

console.log("Testing Instagram access token...");
console.log(`Token (first 10 chars): ${token.substring(0, 10)}...`);

// Debug endpoint to check token validity
const url = `https://graph.instagram.com/me?fields=id,username&access_token=${token}`;

fetch(url)
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(`API Error (${response.status}): ${JSON.stringify(error)}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("✅ Token is valid!");
        console.log("User data:", data);
        console.log("\nThis token can be used in your .env file as META_ACCESS_TOKEN");
    })
    .catch(error => {
        console.error("❌ Token validation failed:", error.message);
        console.log("\nPlease follow the instructions in INSTAGRAM_SETUP.md to generate a new token");
    });
