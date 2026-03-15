// =========================================
// 🚨 SOS REAL-TIME TRACKING SYSTEM (PeerJS)
// ==========================================
let myPeer = null;
let sosConnection = null;
let sosMarker = null;
let sosWatchId = null;

// --- 1. SENDER: The Woman in Distress ---
function startSOS() {
    // Generate a random 4-digit secret code
    const code = Math.floor(1000 + Math.random() * 9000); 
    
    // Create a network room with this code
    myPeer = new Peer('safinity-sos-' + code);
    
    myPeer.on('open', function(id) {
        alert(`🚨 SOS INITIATED!\n\nYour Secret Code is: ${code}\n\nCall or text this code to your trusted contact. Waiting for them to connect...`);
        document.getElementById('sync-status').innerText = "🚨 SOS ACTIVE: Code " + code;
        document.getElementById('sync-status').style.color = "red";
    });

    // When the parent/friend enters the code and connects:
    myPeer.on('connection', function(conn) {
        sosConnection = conn;
        alert("🔒 Trusted contact has connected! Sharing live location...");
        
        // Start watching the phone's GPS in real-time
        if (navigator.geolocation) {
            sosWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const data = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    sosConnection.send(data); // Send directly to parent's phone!
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
}

// --- 2. RECEIVER: The Parent or Friend ---
function trackSOS() {
    const code = prompt("Enter the 4-digit SOS Code provided by your contact:");
    if (!code) return;

    // Join the network anonymously (No MetaMask needed!)
    myPeer = new Peer(); 
    
    myPeer.on('open', function() {
        // Try to connect to the sender's code
        const conn = myPeer.connect('safinity-sos-' + code);
        
        conn.on('open', function() {
            alert("✅ Connected to SOS Sender! Waiting for their GPS signal...");
            document.getElementById('sync-status').innerText = "📍 TRACKING SOS: " + code;
            document.getElementById('sync-status').style.color = "red";
        });

        // Every time the sender's phone moves, update the map!
        conn.on('data', function(data) {
            if (sosMarker) {
                // Move existing marker
                sosMarker.setLatLng([data.lat, data.lng]);
            } else {
                // Create a pulsing red marker for the first time
                sosMarker = L.marker([data.lat, data.lng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41]
                    })
                }).addTo(map); // Uses the 'map' variable from script.js
                sosMarker.bindPopup("<b>🚨 LIVE SOS LOCATION</b>").openPopup();
            }
            // Auto-pan the map to follow them
            map.setView([data.lat, data.lng], 17); 
        });
    });
}
