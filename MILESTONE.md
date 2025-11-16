## MILESTONE 2 PLAN: Utana

**Team:** luucamay + custom army of GPTs
**Track:** [ ] SHIP-A-TON [X] IDEA-TON  
**Date:** November 16, 2025

---

## 📍 WHERE WE ARE NOW

**What we built/validated this weekend:**
- Complete NFT ticket management system deployed to Polkadot Asset Hub TestNet
- Full-stack application with Express.js backend + responsive frontend
- Real-time seat selection with Arkiv blockchain integration for immutable records
- Production-ready smart contract at `0x19493b940443b8f3dFFFD25E094f8EF48686B004`

**What's working:**
- NFT minting integrated with ticket purchases (ERC721 tokens with metadata)
- Interactive seat map with real-time availability and pricing tiers
- Arkiv network storage for seat reservations and transaction history
- Mobile-responsive design with accessibility features
- Complete API documentation and deployment guides

**What still needs work:**
- Zero-knowledge proof system for identity verification
- Community validator network and economic incentives
- Biometric enrollment and privacy-preserving authentication
- Cross-event soulbound identity NFTs

**Blockers or hurdles we hit:**
- ZK circuit complexity requires specialized Noir framework expertise
- Community validator bootstrapping needs clear economic model
- Biometric privacy preservation requires advanced cryptographic implementation

---

## 🚀 WHAT WE'LL SHIP IN 30 DAYS

**Our MVP will do this:**
Utana will demonstrate zero-knowledge proof of concept for identity verification, with a basic community validation system and prototype soulbound NFTs, proving the technical feasibility of privacy-preserving event access.

### Features We'll Build (3 core features)

**Week 1-2: ZK Proof-of-Concept & Research Foundation**
- Feature: Basic ZK circuit implementation using existing Noir templates + simple identity commitment system
- Why it matters: Proves technical feasibility of privacy-preserving verification without building from scratch
- Technical approach: Adapt existing Semaphore/WorldCoin circuits, focus on integration rather than novel cryptography
- Deliverable: Working demo that generates and verifies ZK proofs for dummy identity data

**Week 3: Community Validation Prototype**
- Feature: Simple validator interface + basic economic model simulation (testnet tokens)
- Why it matters: Demonstrates community-driven verification concept with real user interaction
- Technical approach: Build on existing NFT contract, add validator registry and simple voting mechanism
- Deliverable: Functional validator dashboard where community can vote on verification requests

**Week 4: Soulbound NFT Integration + Documentation**
- Feature: Connect ZK proofs to soulbound NFT minting + comprehensive documentation/demo
- Why it matters: Complete end-to-end flow from verification to event access token
- Technical approach: Extend current ticket NFT contract with soulbound properties and ZK verification
- Deliverable: Working prototype where verified users receive non-transferable access NFTs

### Technical Risk Assessment & Mitigation

**High Risk - ZK Circuit Complexity**
- Risk: Building ZK circuits from scratch is extremely complex for 30-day timeline
- Mitigation: Use proven templates (Semaphore, Tornado Cash patterns) and focus on integration
- Fallback: Simplified proof-of-concept using hash commitments if full ZK proves too complex

**Medium Risk - Community Bootstrapping**
- Risk: No real community exists to test validator network
- Mitigation: Create simulated validator accounts + recruit 10-15 beta testers from developer community
- Fallback: Demo with bot validators showing the economic model concept

**Low Risk - Smart Contract Integration** 
- Risk: Integration bugs between ZK system and existing NFT contracts
- Mitigation: Leverage existing working contract as foundation, add features incrementally
- Fallback: Separate contracts that can be composed later if integration proves difficult

### Team Breakdown

**luucamay - Solo Full-Stack Developer & Product Owner** | 40 hrs/week
- Owns: Complete system architecture, smart contract development, frontend/backend implementation, ZK circuit research & development, project coordination
- AI Support: GitHub Copilot for code generation, ChatGPT/Claude for research and documentation, specialized AI tools for cryptographic implementation guidance

**External Consultations** | 5-10 hrs total
- ZK Framework Research: Online courses, documentation deep-dives, open-source implementations study
- Security Best Practices: Automated security scanning tools, established audit checklists, community code reviews
- Economic Model Design: DeFi protocol analysis, tokenomics research, game theory frameworks

### Mentoring & Expertise We Need

**Critical for success:**
- ZK circuit guidance: 2-3 hours of expert consultation to validate approach and avoid major pitfalls
- Community building advice: Marketing/product guidance to recruit initial validator beta testers
- Security review: Automated tools + community code review for smart contract changes

**Nice to have but not blocking:**
- Advanced cryptography optimization (can improve in future iterations)
- Professional UI/UX design (current functional design is sufficient for MVP)
- Economic modeling expertise (simple token rewards sufficient for prototype)

---

## 🎯 WHAT HAPPENS AFTER

**When M2 is done, we plan to...** 
- Iterate on ZK circuit optimization based on prototype learnings and performance testing
- Recruit and onboard 100+ real community validators through developer networks and events
- Add biometric enrollment features and advanced anti-fraud detection mechanisms
- Prepare for limited mainnet beta with select event organizers

**And 6 months out we see our project achieve:**
- 500+ verified humans using soulbound identity NFTs across 5+ pilot events
- Self-sustaining validator community of 100+ active participants earning real rewards
- Proven reduction in event fraud and improved attendee experience metrics
- Partnership discussions with major ticketing platforms for integration opportunities 