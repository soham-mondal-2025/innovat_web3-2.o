<div align="center">
  <h1>Safinity</h1>
  <p><b>Your Safety, Your Data, Your Control</b></p>
  <p><i>Mapping clean washrooms and providing serverless emergency SOS tracking through the power of Web3.</i></p>
  <p><h4>Website link:-</h4>https://static3eternity.vercel.app/</p>
  <br>
</div>

## 💡 The Name: Safety + Sanity = Safinity
The objective behind our name is simple but powerful. **Safinity** is the combination of two core pillars:
* **Safety:** Represented by our decentralized SOS feature, empowering users to instantly and securely share their live location with trusted contacts in case of an emergency.
* **Sanity:** Rooted in "sanitation," representing the peace of mind that comes from having reliable access to a clean, hygienic, and community-verified washroom environment whenever you need it.

Together, they form a unified platform dedicated to protecting your physical security and supporting your basic human needs.

---

## 📖 Overview

Finding safe, hygienic, and verified sanitation spaces is a critical daily challenge, particularly for women and marginalized groups. Safinity is a decentralized application (dApp) that leverages Web3 infrastructure to map safe spaces, ensuring that community-contributed data is immutable, transparent, and censorship-resistant. By combining real-time mapping, emergency SOS tracking, and peer-to-peer cryptocurrency incentives, Safinity turns public safety into a decentralized, community-governed effort.

---

## 🚨 Problem Statement

In the real world, relying on centralized Web2 platforms for safety data presents severe vulnerabilities:
1. **Data Manipulation:** Centralized entities can alter, hide, or delete locations or safety ratings based on corporate interests or external pressures.
2. **Lack of Incentives:** Users who contribute highly valuable safety data (like mapping a safe washroom) receive no tangible reward for their effort.
3. **Privacy & Trust:** Traditional SOS systems rely on centralized servers that can track, store, or leak sensitive live-location data during emergencies.

---

## 🌐 Why Web3? The Case for Decentralization

A safety application requires absolute trust. We chose to build Safinity on Web3 architecture because standard centralized databases cannot guarantee the level of security and transparency required for public safety. Web3 provides:

* **Censorship Resistance:** Safe spaces for marginalized groups can sometimes face coordinated reporting attacks on traditional platforms. By utilizing IPFS and Polygon, once a safe space is mapped, no central authority or corporation can delete it.
* **Data Sovereignty:** Users own their interactions. Emergency tracking operates strictly peer-to-peer (WebRTC), meaning no corporate server ever logs or stores a user's panic coordinates.
* **Trustless Integrity:** Instead of trusting a company's hidden algorithm, all data modifications leave a public, cryptographic audit trail on the blockchain.
* **Micro-Economies:** Web3 allows us to natively integrate Peer-to-Peer (P2P) tipping, turning volunteer mapping into a financially rewarded civic duty without a corporate middleman taking a cut.

---

## 🛠️ Solution

Safinity bridges the gap between digital decentralization and physical safety:
* **Immutable Registry:** All mapped safe spaces and safety ratings are pinned to decentralized storage (IPFS) and secured on the Polygon blockchain. 
* **Radical Transparency:** A live on-chain audit trail allows anyone to verify the integrity of the map data in real-time.
* **Direct Incentives:** A built-in peer-to-peer tipping system allows users to financially reward contributors directly for adding safe spaces.
* **Peer-to-Peer SOS:** Emergency tracking establishes direct, serverless connections between users, ensuring absolute privacy.

---

## ✨ Key Features

* **🗺️ Decentralized Safety Map:** Search, filter (Men, Women, Unisex), and view community-added safe spaces on an interactive map.
* **☁️ IPFS & Polygon Sync:** Add locations and ratings locally, then cryptographically sign transactions via MetaMask to save them permanently to the blockchain.
* **🔍 Live On-Chain Audit Trail:** A built-in developer terminal that outputs live IPFS Content IDs (CIDs) and Polygon Transaction Hashes with clickable block explorer links.
* **💰 Peer-to-Peer Tipping:** Instantly send POL tokens directly to the wallet address of the user who mapped a safe space.
* **🚨 Serverless Emergency SOS:** Generate secure, peer-to-peer tracking links that allow trusted contacts to monitor your live location without server tracking.
* **🛡️ Women's Safety Badges:** Automatic visual badge system for highly-rated women's facilities.

---

## 💻 Technology Stack

### Frontend
* **HTML5, CSS3, JavaScript (ES6+)** - Custom, lightweight, and responsive UI.

### Blockchain / Web3
* **Polygon (Amoy Testnet)** - Layer 2 scaling solution for fast, low-cost smart contract execution.
* **Solidity** - Smart contract development for the decentralized registry.
** **Ethers.js (via CDN)** - Accessed via Cloudflare CDN directly in the HTML client for lightweight blockchain interaction and MetaMask wallet integration without requiring local dependencies.
* **MetaMask** - Web3 wallet authentication and cryptographic signing.

### Database / Storage
* **IPFS (InterPlanetary File System)** - Decentralized file storage.
* **Pinata** - IPFS pinning service and gateway.

### APIs & Tools
* **Leaflet.js** - Interactive mapping library.
* **OpenStreetMap (Nominatim API)** - Geocoding and reverse geocoding.
* **PeerJS (WebRTC)** - Serverless, peer-to-peer data streaming for SOS tracking.

---

## 🏗️ System Architecture

Safinity operates on a decentralized architecture to eliminate single points of failure:

1. **Client Layer:** The user interacts with the Leaflet map and UI dashboard to add or rate a location.
2. **Storage Layer:** The application bundles the JSON map data and pushes it to IPFS via the Pinata API, receiving a unique cryptographic CID.
3. **Consensus Layer:** Ethers.js prompts the user's MetaMask to sign a transaction containing the CID.
4. **Blockchain Layer:** The Polygon smart contract receives the transaction, verifying the sender and permanently updating the `databaseHash` state variable.
5. **Retrieval Flow:** On load, the dApp queries the Polygon contract for the latest CID, fetches the JSON from IPFS, and populates the map.

---

## 🚀 Usage

### 1. Interacting with the Map
* Connect your MetaMask wallet (Polygon Amoy network).
* Use the **Search** bar to navigate to your city, or filter existing pins by category.

### 2. Contributing Data
* Click **➕ Add Washroom** and drop a pin on your current location.
* Fill in the details and click Save.
* Click **☁️ Sync to IPFS**. Confirm the MetaMask transaction to permanently record the data on the blockchain.
* Watch the **Live Audit Trail** for your verifiable transaction hash!

### 3. Emergency SOS
* Click **🚨 Send SOS** to generate a unique, serverless tracking ID.
* Share the ID with a trusted contact.
* The contact clicks **📍 Track SOS**, enters the ID, and establishes a direct P2P connection to view your live GPS coordinates.

---

## 🔮 Future Improvements

* **DAO Governance:** Implement a staking system where locations are only "Verified" after multiple independent wallets stake tokens on their legitimacy.
* **Soulbound Tokens (SBTs):** Mint non-transferable NFT badges to wallets that consistently contribute highly-rated safe spaces, building on-chain reputation.
* **Zero-Knowledge Proofs (zk-SNARKs):** Allow users to anonymously verify their identity/gender for rating spaces without exposing their wallet history.
* **Mobile App:** Package the Web3 logic into a React Native application for easier on-the-go access.

---

## 🌍 Impact

Safinity demonstrates the real-world utility of Web3 beyond decentralized finance (DeFi). By creating an immutable, community-owned infrastructure for physical safety, it empowers individuals to take control of their environment, protects critical data from corporate manipulation, and establishes a trustless micro-economy that rewards civic contribution.
