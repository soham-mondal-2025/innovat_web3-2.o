// 1. Configuration
const contractAddress = "0xC34975701CBBBBdD1390bD8159C55E6A6A43fC25";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0OTlkZWUzZS02MTczLTQ3NmEtYWU0MS1mNjU0NWM3Zjk5ZWMiLCJlbWFpbCI6InByYXNodW4yNDA2MjBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImI1MmQzM2FjYzgzY2NmYzcyMGViIiwic2NvcGVkS2V5U2VjcmV0IjoiZDAxYzI1ZTU3NGU0MWZmMWNjM2QyOTRlZDY2MzY3NzQ0OGVkOWVhZjQ0OTY4ODIwMjY1NWRkZjgwODI4N2RkOCIsImV4cCI6MTgwNTAyMjA2Mn0.IHCAJdGdT1oSgw7qqWjAJOnKIap3SrIFA4LiMIglY4w";

const contractABI = [ 
    {"inputs": [],"stateMutability": "nonpayable","type": "constructor"},
    {"anonymous": false,"inputs": [{"indexed": false,"internalType": "string","name": "newHash","type": "string"},{"indexed": false,"internalType": "address","name": "updatedBy","type": "address"}],"name": "DatabaseUpdated","type": "event"},
    {"inputs": [{"internalType": "string","name": "_newHash","type": "string"}],"name": "updateDatabase","outputs": [],"stateMutability": "nonpayable","type": "function"},
    {"inputs": [],"name": "admin","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},
    {"inputs": [],"name": "databaseHash","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},
    {"inputs": [],"name": "getLatestHash","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"}
];

// 2. Global Variables
let secureLooContract;
let userWalletAddress;
let washrooms = []; 
let tempCoords = null;
let markerLayer;

// 3. Initialize Map & Icons
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
markerLayer = L.layerGroup().addTo(map);

const LooIcon = L.Icon.Default.extend({
    options: {
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
});

function getLooIcon(type) {
    const colors = { 'men': 'blue', 'women': 'violet', 'unisex': 'green' };
    const color = colors[type] || 'blue';
    return new LooIcon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    });
}

// 4. Blockchain Logic
async function initBlockchain() {
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const amoyChainId = "0x13882"; 

            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: amoyChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: amoyChainId,
                            chainName: "Polygon Amoy Testnet",
                            rpcUrls: ["https://rpc-amoy.polygon.technology"],
                            nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                            blockExplorerUrls: ["https://amoy.polygonscan.com/"]
                        }]
                    });
                }
            }

            const signer = provider.getSigner();
            secureLooContract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("Blockchain Bridge Ready on Amoy!");
        } catch (err) {
            console.error("Failed to init blockchain:", err);
        }
    }
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWalletAddress = accounts[0];
            await initBlockchain(); 
            await loadDataFromBlockchain(); 

            document.getElementById('connect-wallet').innerText = 
                "Connected: " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        } catch (error) {
            console.error("Connection failed", error);
        }
    }
}

async function loadDataFromBlockchain() {
    try {
        const latestHash = await secureLooContract.getLatestHash();
        if (latestHash && latestHash !== "") {
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${latestHash}`);
            washrooms = await response.json();
            displayWashrooms('all');
            if(document.getElementById('sync-status')) {
                document.getElementById('sync-status').innerText = "Status: Synced";
                document.getElementById('sync-status').style.color = "lightgreen";
            }
        }
    } catch (error) {
        console.log("No data found on blockchain yet.");
    }
}

async function saveToIPFS() {
    if (!userWalletAddress) return alert("Connect wallet first!");
    
    try {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        const data = JSON.stringify({
            pinataContent: washrooms, 
            pinataMetadata: { name: "SecureLoo_Data" }
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: data
        });

        const resData = await response.json();
        const ipfsHash = resData.IpfsHash; 
        
        alert("IPFS Success! Confirm MetaMask to save to Blockchain.");
        const tx = await secureLooContract.updateDatabase(ipfsHash);
        await tx.wait(); 
        
        alert("Success! Permanent on Polygon! 🚀");
        document.getElementById('sync-status').innerText = "Status: Fully Synced";
        document.getElementById('sync-status').style.color = "lightgreen";
    } catch (error) {
        console.error("Save failed:", error);
    }
}

// 5. UI & Map Logic
function displayWashrooms(filterType) {
    markerLayer.clearLayers();
    washrooms.forEach(loo => {
        if (filterType === 'all' || loo.type === filterType) {
            const marker = L.marker([loo.lat, loo.lng], { icon: getLooIcon(loo.type) });
            const stars = "⭐".repeat(loo.safety || 0) || "No ratings";
            
            marker.bindPopup(`
                <div class="popup-content">
                    <b>${loo.name}</b><br>
                    <span>Type: ${loo.type.toUpperCase()}</span><br>
                    <div>Safety: ${stars}</div>
                    <span>${loo.verified ? "✅ Verified" : "⚠️ Unverified"}</span><br>
                    <button onclick="rateWashroom(${loo.id})">Rate Safety</button>
                </div>
            `);
            marker.addTo(markerLayer);
        }
    });
}

function saveNewWashroom() {
    const name = document.getElementById('loo-name').value;
    const type = document.getElementById('loo-type').value;

    if (!name || !tempCoords) return alert("Click map and enter name!");

    const newLoo = {
        id: washrooms.length > 0 ? Math.max(...washrooms.map(l => l.id)) + 1 : 1,
        name: name,
        lat: tempCoords.lat,
        lng: tempCoords.lng,
        type: type,
        verified: false,
        safety: 0
    };

    washrooms.push(newLoo); 
    displayWashrooms('all'); 
    toggleForm(); 
    alert("Added locally! Click 'Sync to IPFS' to save permanently.");
}

function rateWashroom(id) {
    const rating = prompt("Rate 1-5:");
    const ratingNum = parseInt(rating);
    if (ratingNum >= 1 && ratingNum <= 5) {
        const loo = washrooms.find(l => l.id === id);
        loo.safety = ratingNum;
        if (loo.type === "women" && ratingNum >= 4) loo.name = "🛡️ " + loo.name; 
        displayWashrooms('all');
    }
}

// 6. Map Events & Search
function toggleForm() {
    if (!userWalletAddress) return alert("Connect wallet first!");
    document.getElementById('add-form').classList.toggle('hidden');
}

map.on('click', function(e) {
    if (!document.getElementById('add-form').classList.contains('hidden')) {
        tempCoords = e.latlng;
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(map).bindPopup("Selected!").openPopup();
    }
});

async function searchLocation() {
    const query = document.getElementById('search-input').value;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();
    if (data.length > 0) map.flyTo([data[0].lat, data[0].lon], 14);
}

function locateUser() {
    map.locate({setView: true, maxZoom: 15});
}

locateUser();