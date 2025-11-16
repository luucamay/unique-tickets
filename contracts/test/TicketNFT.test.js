const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketNFT", function () {
  let TicketNFT;
  let ticketNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    TicketNFT = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFT.deploy(owner.address);
    await ticketNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await ticketNFT.name()).to.equal("Event Tickets");
      expect(await ticketNFT.symbol()).to.equal("TICKET");
    });

    it("Should set the owner correctly", async function () {
      expect(await ticketNFT.owner()).to.equal(owner.address);
    });

    it("Should start with token ID counter at 0", async function () {
      expect(await ticketNFT.getCurrentTokenId()).to.equal(0);
      expect(await ticketNFT.totalMinted()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a ticket NFT successfully", async function () {
      const seatIds = [1, 2, 3];
      const eventId = "EVENT_2023_001";
      const price = ethers.parseEther("0.1");

      await expect(ticketNFT.mintTicket(addr1.address, seatIds, eventId, price))
        .to.emit(ticketNFT, "TicketMinted")
        .withArgs(1, addr1.address, seatIds, eventId, price);

      expect(await ticketNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await ticketNFT.getCurrentTokenId()).to.equal(1);
      expect(await ticketNFT.totalMinted()).to.equal(1);
    });

    it("Should prevent minting duplicate seats for the same event", async function () {
      const seatIds = [1, 2];
      const eventId = "EVENT_2023_001";
      const price = ethers.parseEther("0.1");

      // First mint should succeed
      await ticketNFT.mintTicket(addr1.address, seatIds, eventId, price);

      // Second mint with overlapping seats should fail
      await expect(
        ticketNFT.mintTicket(addr2.address, [2, 3], eventId, price)
      ).to.be.revertedWith("Seat already minted for this event");
    });

    it("Should allow minting same seats for different events", async function () {
      const seatIds = [1, 2];
      const price = ethers.parseEther("0.1");

      await ticketNFT.mintTicket(addr1.address, seatIds, "EVENT_A", price);
      await ticketNFT.mintTicket(addr2.address, seatIds, "EVENT_B", price);

      expect(await ticketNFT.totalMinted()).to.equal(2);
    });

    it("Should only allow owner to mint", async function () {
      const seatIds = [1];
      const eventId = "EVENT_2023_001";
      const price = ethers.parseEther("0.1");

      await expect(
        ticketNFT.connect(addr1).mintTicket(addr2.address, seatIds, eventId, price)
      ).to.be.revertedWithCustomError(ticketNFT, "OwnableUnauthorizedAccount");
    });

    it("Should allow simple minting with safeMint", async function () {
      await expect(ticketNFT.safeMint(addr1.address))
        .to.emit(ticketNFT, "TicketMinted");

      expect(await ticketNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await ticketNFT.getCurrentTokenId()).to.equal(1);
      expect(await ticketNFT.totalMinted()).to.equal(1);
    });
  });

  describe("Ticket Information", function () {
    beforeEach(async function () {
      const seatIds = [5, 6, 7];
      const eventId = "EVENT_2023_002";
      const price = ethers.parseEther("0.2");
      
      await ticketNFT.mintTicket(addr1.address, seatIds, eventId, price);
    });

    it("Should return correct ticket information", async function () {
      const [seatIds, eventId, price, isValid] = await ticketNFT.getTicketInfo(1);
      
      expect(seatIds).to.deep.equal([5n, 6n, 7n]);
      expect(eventId).to.equal("EVENT_2023_002");
      expect(price).to.equal(ethers.parseEther("0.2"));
      expect(isValid).to.equal(true);
    });

    it("Should validate tickets correctly", async function () {
      expect(await ticketNFT.getTicketInfo(1)).to.have.property('3', true); // isValid = true
      
      await expect(ticketNFT.validateTicket(1))
        .to.emit(ticketNFT, "TicketValidated")
        .withArgs(1, owner.address, false);

      expect(await ticketNFT.getTicketInfo(1)).to.have.property('3', false); // isValid = false
    });
  });

  describe("Owner Queries", function () {
    beforeEach(async function () {
      // Mint multiple tickets to addr1
      await ticketNFT.mintTicket(addr1.address, [1], "EVENT_A", ethers.parseEther("0.1"));
      await ticketNFT.mintTicket(addr1.address, [2], "EVENT_A", ethers.parseEther("0.1"));
      await ticketNFT.mintTicket(addr2.address, [3], "EVENT_A", ethers.parseEther("0.1"));
    });

    it("Should return all tokens owned by an address", async function () {
      const addr1Tokens = await ticketNFT.getTicketsByOwner(addr1.address);
      const addr2Tokens = await ticketNFT.getTicketsByOwner(addr2.address);

      expect(addr1Tokens).to.deep.equal([1n, 2n]);
      expect(addr2Tokens).to.deep.equal([3n]);
    });

    it("Should return empty array for address with no tokens", async function () {
      const tokens = await ticketNFT.getTicketsByOwner(addr3.address);
      expect(tokens).to.deep.equal([]);
    });
  });

  describe("Seat Checking", function () {
    it("Should correctly track minted seats", async function () {
      const eventId = "EVENT_CHECK";
      
      expect(await ticketNFT.isSeatMinted(eventId, 1)).to.equal(false);
      
      await ticketNFT.mintTicket(addr1.address, [1], eventId, ethers.parseEther("0.1"));
      
      expect(await ticketNFT.isSeatMinted(eventId, 1)).to.equal(true);
      expect(await ticketNFT.isSeatMinted(eventId, 2)).to.equal(false);
    });
  });
});