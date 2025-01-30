# **Box3**

**Box3** is a cutting-edge solution that integrates IoT, RFID technology, and blockchain-powered smart contracts to create a secure, decentralized package authentication system. Built for the **Supra Movers Hackathon**, Box3 aims to revolutionize supply chain security and package verification.

---

## **Team Higgs**

We are **Team Higgs**, a group of students from **NITK, Surathkal**. Our team members include:

- **Fahim Ahmed** [LinkedIn](https://www.linkedin.com/in/fahim-ahmed-35142a256/)
- **Apoorva Agrawal** [LinkedIn](https://www.linkedin.com/in/apoorva-agrawal-8302b825a/)
- **Vedant Tarale** [LinkedIn](https://www.linkedin.com/in/vedant-tarale-802528173/)
- **Abhishek Satpathy** [LinkedIn](https://www.linkedin.com/in/abhishek-satpathy/)

---

## **Video Explainer**

(To be provided: Includes a walkthrough of the team, project document, and live demo showcasing package authentication via RFID, Move smart contract execution, and web-based verification.)

---

## **Overview**

**Box3** uses RFID technology and blockchain to ensure package authenticity and traceability. By integrating IoT devices such as Raspberry Pi, RFID cards/readers, and a **Supra blockchain smart contract written purely in Move language**, **Box3** provides an innovative approach to secure package management. The project includes a seamless web interface for both the customer and the vendor/delivery agent to preform seamless interactions.

---

## **Our Vision**

We envision a future where package authentication is **secure, decentralized, and tamper-proof**. By leveraging blockchain, IoT, and RFID technology, Box3 eliminates the risk of counterfeit goods and ensures complete traceability of shipments.

---

## **Our Approach**

Box3 takes a **multi-layered security approach** by combining:

1. **RFID technology** for package tagging and scanning.
2. **IoT integration** via Raspberry Pi to process package data.
3. **Blockchain (Supra, Move-based smart contract)** for immutable storage and smart contract execution.
4. **Web-based platform (Next.js)** for user interaction and verification.
5. **External Verification (Galadriel)** to cross-check package authenticity.

With this setup, Box3 guarantees a **seamless and fraud-resistant** package authentication system.

---

## **System Architecture**

### **Core Components**

1. **RFID Technology:**

   - Reads and writes package data securely.
   - Ensures authenticity through RFID-enabled tags.

2. **Raspberry Pi & Django Backend:**

   - Acts as the central hub for RFID scanning and processing.
   - Connects to external verification systems for data validation.

3. **Blockchain (Supra, Move Smart Contract):**

   - Stores package verification details immutably.
   - Executes a single **Move language-based** smart contract to prevent data tampering.

4. **Web App (Next.js):**

   - Facilitates package verification via an intuitive interface.
   - Allows package image capture for additional authentication.

5. **External Verification (Galadriel):**
   - Ensures legitimacy through cross-checking with external sources.

---

## **Features**

- **RFID-Based Secure Authentication:** Prevents package tampering.
- **Decentralized Blockchain Storage:** Ensures immutability of records.
- **IoT-Powered Verification:** Real-time package tracking.
- **Web-Based Access:** Secure and easy-to-use verification interface.
- **Smart Contract Automation:** Transparent and trustless validation.
- **Move-Based Smart Contract:** Ensures efficiency, security, and tamper-proof execution.

---

## **Technology Stack**

| **Component**   | **Technology**     |
| --------------- | ------------------ |
| **Web3 Wallet** | Starkey Wallet     |
| **IoT**         | RFID, Raspberry Pi |
| **Backend**     | Django             |
| **Web App**     | Next.js            |
| **Blockchain**  | Supra              |

---

## **Implementation**

### **1. Prerequisites**

- **Hardware:** Raspberry Pi with an RFID receiver.
- **Software:**
  - Python, Node.js, npm
  - Supra account setup

### **2. Clone the Repository**

```bash
git clone https://github.com/imApoorva36/Higgs-Supra-Hackathon.git
cd Higgs-Supra-Hackathon
```

### **3. Backend Setup (Django)**

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### **4. Web App Setup (Next.js)**

```bash
cd web
npm install
npm run dev
```

---

## **Challenges Faced**

- **Hardware Constraints:** Limited RFID compatibility with Raspberry Pi.
- **Blockchain Integration:** Optimizing **Move** smart contract execution on Supra.
- **Decentralized Verification:** Ensuring real-time validation while maintaining decentralization.

---

## **Demo Instructions**

### **How to Run the Demo**

1. Clone the repository and follow the setup instructions above.
2. Use **Starkey Wallet** for blockchain interactions.
3. Run the backend and web frontend as described.
4. Verify packages using RFID scans through the web interface.
5. Smart contract verification occurs on Supra blockchain.

### **Supra Interaction**

Box3 actively interacts with Supra's services by deploying and executing **Move-based smart contracts** for secure and decentralized package authentication.

---

## **Contributing**

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository:
   ```bash
   git fork https://github.com/imApoorva36/Higgs-Supra-Hackathon.git
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## **License**

This project is licensed under the [MIT License](LICENSE).

---

## **Final Notes**

- **Public repository available for all aspects of the project.**
- **Smart contract is fully written in Move for efficiency and security.**
- **All interactions with Supra APIs and network are meaningful and fully documented.**
- **Detailed documentation ensures ease of review and reproducibility.**
