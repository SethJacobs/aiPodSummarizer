// Complete Extension Integration Test
// This simulates the exact behavior of the QuickPod extension

async function simulateExtensionBehavior() {
    console.log("🧪 Testing QuickPod Extension Integration...\n");

    // Test 1: Backend Connection
    console.log("1️⃣ Testing backend connection...");
    try {
        const response = await fetch('http://localhost:8080/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await response.json();
        console.log("✅ Backend connection successful");
        console.log("   Response:", data);
    } catch (error) {
        console.log("❌ Backend connection failed:", error.message);
        return;
    }

    // Test 2: Simulate YouTube page data collection
    console.log("\n2️⃣ Simulating YouTube page data collection...");
    const youtubePageData = {
        source: "YouTube",
        title: "Rick Astley - Never Gonna Give You Up",
        description: "Official music video",
        transcript: null,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    };
    console.log("✅ Page data collected:", youtubePageData);

    // Test 3: Send to backend (simulating extension popup.js behavior)
    console.log("\n3️⃣ Sending to backend (simulating extension behavior)...");
    try {
        const backendUrl = "http://localhost:8080/api/summarize";
        const res = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: youtubePageData.url })
        });
        
        if (!res.ok) {
            console.log(`❌ Backend HTTP error ${res.status}`);
            return;
        }
        
        const json = await res.json();
        if (!json.ok) {
            console.log("❌ Backend error:", json.error);
            return;
        }

        console.log("✅ Backend processing successful!");
        console.log("   Summary:", json.summary);
        console.log("   Transcript length:", json.transcript ? json.transcript.length : 0, "characters");
        console.log("   Bullets:", json.bullets ? json.bullets.length : 0, "items");

        // Test 4: Simulate extension UI rendering
        console.log("\n4️⃣ Simulating extension UI rendering...");
        
        // Simulate renderSummaryText function from popup.js
        const renderSummaryText = (text) => {
            return text
                .replace(/\r/g, "")
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => line.startsWith("-") || line.match(/^\d+\./) ? line : `• ${line}`)
                .join("\n");
        };

        const renderedSummary = renderSummaryText(json.summary || (Array.isArray(json.bullets) ? json.bullets.join("\n") : "(no summary)"));
        console.log("✅ UI rendering simulation complete");
        console.log("   Rendered summary:", renderedSummary);

        console.log("\n🎉 All tests passed! Extension should work perfectly with the backend.");

    } catch (error) {
        console.log("❌ Backend request failed:", error.message);
    }
}

// Test 5: Simulate different platforms
async function testDifferentPlatforms() {
    console.log("\n5️⃣ Testing different platform URLs...");
    
    const testUrls = [
        { platform: "YouTube", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
        { platform: "Spotify", url: "https://open.spotify.com/episode/example" },
        { platform: "Invalid", url: "https://invalid-url.com/test" }
    ];

    for (const test of testUrls) {
        console.log(`\n   Testing ${test.platform}...`);
        try {
            const response = await fetch('http://localhost:8080/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: test.url })
            });
            const data = await response.json();
            
            if (data.ok) {
                console.log(`   ✅ ${test.platform} - Success`);
            } else {
                console.log(`   ⚠️ ${test.platform} - Backend error: ${data.error}`);
            }
        } catch (error) {
            console.log(`   ❌ ${test.platform} - Request failed: ${error.message}`);
        }
    }
}

// Run all tests
async function runAllTests() {
    await simulateExtensionBehavior();
    await testDifferentPlatforms();
    console.log("\n🏁 Extension integration testing complete!");
}

// Export for Node.js or run directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests };
} else {
    runAllTests();
}