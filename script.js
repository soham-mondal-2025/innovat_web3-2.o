// --- BLOCKCHAIN CONFIGURATION ---
const contractAddress = "0xC34975701CBBBBdD1390bD8159C55E6A6A43fC25";
const contractABI = [ 
    {"inputs": [],"stateMutability": "nonpayable","type": "constructor"},
    {"anonymous": false,"inputs": [{"indexed": false,"internalType": "string","name": "newHash","type": "string"},{"indexed": false,"internalType": "address","name": "updatedBy","type": "address"}],"name": "DatabaseUpdated","type": "event"},
    {"inputs": [{"internalType": "string","name": "_newHash","type": "string"}],"name": "updateDatabase","outputs": [],"stateMutability": "nonpayable","type": "function"},
    {"inputs": [],"name": "admin","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},
    {"inputs": [],"name": "databaseHash","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"},
    {"inputs": [],"name": "getLatestHash","outputs": [{"internalType": "string","name": "","type": "string"}],"stateMutability": "view","type": "function"}
];

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0OTlkZWUzZS02MTczLTQ3NmEtYWU0MS1mNjU0NWM3Zjk5ZWMiLCJlbWFpbCI6InByYXNodW4yNDA2MjBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImI1MmQzM2FjYzgzY2NmYzcyMGViIiwic2NvcGVkS2V5U2VjcmV0IjoiZDAxYzI1ZTU3NGU0MWZmMWNjM2QyOTRlZDY2MzY3NzQ0OGVkOWVhZjQ0OTY4ODIwMjY1NWRkZjgwODI4N2RkOCIsImV4cCI6MTgwNTAyMjA2Mn0.IHCAJdGdT1oSgw7qqWjAJOnKIap3SrIFA4LiMIglY4w";

let secureLooContract;
let userWalletAddress = null;

async function initBlockchain() {
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const amoyChainId = "0x13882"; // 80002 in Hexadecimall

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
            console.log("Wallet connected:", userWalletAddress);
        } catch (error) {
            console.error("User denied connection", error);
        }
    } else {
        alert("MetaMask not detected!");
    }
}

async function saveToIPFS() {
    if (!userWalletAddress) {
        alert("Please connect your wallet first!");
        return;
    }

    addAuditLog("Initiating IPFS Upload via Pinata...", null, null);
    
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const data = JSON.stringify({
        pinataContent: washrooms, 
        pinataMetadata: { name: "SecureLoo_Data" }
    });

    try {
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
        
        addAuditLog(`Data successfully pinned to IPFS!`, `https://gateway.pinata.cloud/ipfs/${ipfsHash}`, ipfsHash);

        if (!secureLooContract) {
            alert("Blockchain bridge not ready.");
            return;
        }

        addAuditLog("Awaiting MetaMask Signature to write to Polygon...", null, null);
        const tx = await secureLooContract.updateDatabase(ipfsHash);
        
        addAuditLog(`Transaction sent! Waiting for block confirmation...`, `https://amoy.polygonscan.com/tx/${tx.hash}`, tx.hash);
        
        await tx.wait(); 
        
        addAuditLog(`✅ Transaction Confirmed! Map is permanently secured on Polygon.`, `https://amoy.polygonscan.com/tx/${tx.hash}`, tx.hash);
        
        document.getElementById('sync-status').innerText = "Status: Fully Synced with Polygon";
        document.getElementById('sync-status').style.color = "lightgreen";

    } catch (error) {
        console.error("Error in save process:", error);
        addAuditLog(`❌ Error: Transaction failed or rejected by user.`, null, null);
    }
}

async function loadDataFromBlockchain() {
    try {
        console.log("Checking blockchain for saved data...");
        if (!secureLooContract) await initBlockchain();

        const latestHash = await secureLooContract.getLatestHash();
        
        if (latestHash && latestHash !== "") {
            console.log("Found Hash:", latestHash);
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${latestHash}`);
            const data = await response.json();
            
            washrooms = data;
            displayWashrooms('all');
            console.log("Successfully restored " + washrooms.length + " washrooms from Blockchain!");
            document.getElementById('sync-status').innerText = "Status: Synced (Data Loaded)";
            document.getElementById('sync-status').style.color = "lightgreen";
        } else {
            console.log("No data found on blockchain yet.");
        }
    } catch (error) {
        console.error("Error loading data from blockchain:", error);
    }
}

// --- MAP AND UI LOGIC ---
const map = L.map('map').setView([22.5726, 88.3639], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let washrooms = []; 
let markerLayer = L.layerGroup().addTo(map);
let tempCoords = null; 
let tempMarker = null; 

const LooIcon = L.Icon.Default.extend({
    options: {
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    }
});

function getLooIcon(type) {
    const colors = { 'men': 'blue', 'women': 'pink', 'unisex': 'green' };
    return new LooIcon({iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colors[type] || 'blue'}.png`});
}

function revealMap() {
    const mapContainer = document.getElementById('main-map-container');
    
    if (mapContainer && mapContainer.classList.contains('hidden')) {
        mapContainer.classList.remove('hidden');
        
        setTimeout(() => {
            map.invalidateSize();
            addAuditLog("Locating user for better experience...");
            map.locate({setView: true, maxZoom: 16});
        }, 100);
    }
}

function displayWashrooms(filterType) {
    markerLayer.clearLayers();

    washrooms.forEach(loo => {
        if (filterType === 'all' || loo.type === filterType) {
            const marker = L.marker([loo.lat, loo.lng], { icon: getLooIcon(loo.type) }); 
            const safetyRating = loo.safety || 0;
            const stars = "⭐".repeat(safetyRating) || "No ratings yet";
            
            const creatorText = loo.creator 
                ? `${loo.creator.slice(0, 6)}...${loo.creator.slice(-4)}` 
                : "Anonymous";

            marker.bindPopup(`
                <div class="popup-content">
                    <b>${loo.name}</b><br>
                    <span style="font-size: 0.8em; color: gray;">Added by: ${creatorText}</span><br>
                    <span>Type: ${loo.type.toUpperCase()}</span><br>
                    <div class="rating-stars">Safety: ${stars}</div>
                    <span>Status: ${loo.verified ? "✅ Verified" : "⚠️ Unverified"}</span><br>
                    <button class="rate-btn" onclick="rateWashroom(${loo.id})">Rate Safety</button>
                    <button class="rate-btn" style="background:#27ae60; margin-top:5px;" onclick="tipCreator('${loo.creator}')">💰 Tip Contributor</button>
                </div>
            `);
            marker.addTo(markerLayer);
        }
    });
}

function filterWashrooms(type) {
    revealMap();
    displayWashrooms(type);
}

function toggleForm() {
    if (!userWalletAddress) {
        alert("Please connect your MetaMask wallet first to add a washroom.");
        return;
    }
    revealMap();
    const form = document.getElementById('add-form');
    form.classList.toggle('hidden');
    
    if (form.classList.contains('hidden')) {
        tempCoords = null;
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    }
}

map.on('click', function(e) {
    if (!document.getElementById('add-form').classList.contains('hidden')) {
        tempCoords = e.latlng;
        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        tempMarker.bindPopup("Location selected! Now fill the form.").openPopup();
    }
});

function saveNewWashroom() {
    if (!userWalletAddress) {
        alert("Please connect your wallet first!");
        return;
    }
    const name = document.getElementById('loo-name').value;
    const type = document.getElementById('loo-type').value;

    if (!name || !tempCoords) {
        alert("Please enter a name and click a spot on the map!");
        return;
    }

    const newLoo = {
        id: washrooms.length > 0 ? Math.max(...washrooms.map(l => l.id)) + 1 : 1,
        name: name,
        lat: tempCoords.lat,
        lng: tempCoords.lng,
        type: type,
        verified: false,
        safety: 0,
        creator: userWalletAddress 
    };

    washrooms.push(newLoo); 
    displayWashrooms('all'); 
    toggleForm(); 
    document.getElementById('loo-name').value = '';
    alert("Added locally! Sync to Blockchain to make it permanent.");
}

function rateWashroom(id) {
    if (!userWalletAddress) { alert("Connect your wallet to rate!"); return; }
    const rating = prompt("Rate safety from 1 to 5 stars:");
    const ratingNum = parseInt(rating);
    if (ratingNum >= 1 && ratingNum <= 5) {
        const loo = washrooms.find(l => l.id === id);
        loo.safety = ratingNum;
        if (loo.type === "women" && ratingNum >= 4 && !loo.name.includes("🛡️")) {
            loo.name = "🛡️ " + loo.name; 
        }
        displayWashrooms('all'); 
        addAuditLog("Rating updated locally. Sync needed.");
    }
}

// --- 🏆 WEB3 FEATURE: PEER-TO-PEER TIPPING ---
async function tipCreator(address) {
    if (!address || address === "undefined") { alert("No wallet address found for this creator."); return; }
    if (!window.ethereum) return;
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        addAuditLog(`Preparing to tip 0.5 POL to ${address}...`);
        const tx = await signer.sendTransaction({
            to: address,
            value: ethers.utils.parseEther("0.5") 
        });
        addAuditLog("Tip sent! Waiting for confirmation...", `https://amoy.polygonscan.com/tx/${tx.hash}`, tx.hash);
        await tx.wait();
        alert("Success! You've rewarded a community contributor.");
    } catch (err) {
        addAuditLog("Tipping cancelled or failed.");
    }
}

// --- LOCATION & SEARCH ---
map.on('locationfound', (e) => addAuditLog("Location synced."));
map.on('locationerror', () => addAuditLog("Location access denied."));

async function findAddress() {
    const address = document.getElementById('loo-address').value;
    if (!address) return;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        const data = await response.json();
        if (data.length > 0) {
            tempCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            map.setView([tempCoords.lat, tempCoords.lng], 16);
            if (tempMarker) map.removeLayer(tempMarker);
            tempMarker = L.marker([tempCoords.lat, tempCoords.lng]).addTo(map).bindPopup("Is this the spot?").openPopup();
        }
    } catch (error) { console.error(error); }
}

async function searchLocation() {
    const query = document.getElementById('search-input').value;
    if (!query) return;
    revealMap();
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await response.json();
        if (data.length > 0) map.flyTo([data[0].lat, data[0].lon], 14);
    } catch (error) { console.error(error); }
}

// --- AUDIT TRAIL LOGGER ---
function addAuditLog(message, link = null, hash = null) {
    const logsContainer = document.getElementById('audit-logs');
    const placeholder = logsContainer.querySelector('.placeholder');
    if (placeholder) placeholder.remove();
    const time = new Date().toLocaleTimeString();
    let linkHTML = link && hash ? `<div class="log-hash">🔗 Explorer: <a href="${link}" target="_blank">${hash.slice(0, 8)}...</a></div>` : '';
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<div style="font-weight: 600;">[${time}] ${message}</div>${linkHTML}`;
    logsContainer.prepend(logEntry);
}
