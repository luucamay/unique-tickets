// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketNFT
 * @dev NFT contract for event tickets with custom functionality
 * Compatible with Polkadot Hub and OpenZeppelin Contracts ^5.0.0
 */
contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Struct to store ticket information
    struct TicketInfo {
        uint256[] seatIds;      // Array of seat IDs
        string eventId;         // Event identifier
        uint256 price;          // Ticket price in wei
        bool isValid;           // Ticket validity status
        uint256 mintedAt;       // Timestamp when minted
    }
    
    // Mapping from token ID to ticket information
    mapping(uint256 => TicketInfo) private _ticketInfo;
    
    // Mapping to track minted seat IDs to prevent double-minting
    mapping(string => mapping(uint256 => bool)) private _mintedSeats;
    
    // Events
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256[] seatIds,
        string eventId,
        uint256 price
    );
    
    event TicketValidated(
        uint256 indexed tokenId,
        address indexed validator,
        bool isValid
    );
    
    constructor(
        address initialOwner
    ) ERC721("Event Tickets", "TICKET") Ownable(initialOwner) {
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new ticket NFT
     * @param to Address to mint the ticket to
     * @param seatIds Array of seat IDs for this ticket
     * @param eventId Event identifier
     * @param price Ticket price in wei
     * @return tokenId The ID of the minted token
     */
    function mintTicket(
        address to,
        uint256[] calldata seatIds,
        string calldata eventId,
        uint256 price
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(seatIds.length > 0, "Must specify at least one seat");
        require(bytes(eventId).length > 0, "Event ID cannot be empty");
        
        // Check if any seats are already minted for this event
        for (uint256 i = 0; i < seatIds.length; i++) {
            require(
                !_mintedSeats[eventId][seatIds[i]], 
                "Seat already minted for this event"
            );
        }
        
        uint256 tokenId = _nextTokenId++;
        
        // Mark seats as minted
        for (uint256 i = 0; i < seatIds.length; i++) {
            _mintedSeats[eventId][seatIds[i]] = true;
        }
        
        // Store ticket information
        _ticketInfo[tokenId] = TicketInfo({
            seatIds: seatIds,
            eventId: eventId,
            price: price,
            isValid: true,
            mintedAt: block.timestamp
        });
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        emit TicketMinted(tokenId, to, seatIds, eventId, price);
        
        return tokenId;
    }
    
    /**
     * @dev Simple mint function for basic NFT creation (compatible with OpenZeppelin pattern)
     * @param to Address to mint the ticket to
     */
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        
        // Create default ticket info for simple mint
        uint256[] memory defaultSeats = new uint256[](1);
        defaultSeats[0] = tokenId; // Use token ID as default seat
        
        _ticketInfo[tokenId] = TicketInfo({
            seatIds: defaultSeats,
            eventId: "DEFAULT_EVENT",
            price: 0,
            isValid: true,
            mintedAt: block.timestamp
        });
        
        _safeMint(to, tokenId);
        
        emit TicketMinted(tokenId, to, defaultSeats, "DEFAULT_EVENT", 0);
    }
    
    /**
     * @dev Set the metadata URI for a token
     * @param tokenId Token ID to set URI for
     * @param uri Metadata URI
     */
    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, uri);
    }
    
    /**
     * @dev Validate a ticket (mark as used/invalid)
     * @param tokenId Token ID to validate
     * @return isValid Current validity status
     */
    function validateTicket(uint256 tokenId) external onlyOwner returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TicketInfo storage ticket = _ticketInfo[tokenId];
        ticket.isValid = false; // Mark as used/invalid
        
        emit TicketValidated(tokenId, msg.sender, false);
        
        return ticket.isValid;
    }
    
    /**
     * @dev Get ticket information
     * @param tokenId Token ID to query
     * @return seatIds Array of seat IDs
     * @return eventId Event identifier
     * @return price Ticket price
     * @return isValid Validity status
     */
    function getTicketInfo(uint256 tokenId) external view returns (
        uint256[] memory seatIds,
        string memory eventId,
        uint256 price,
        bool isValid
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TicketInfo memory ticket = _ticketInfo[tokenId];
        return (ticket.seatIds, ticket.eventId, ticket.price, ticket.isValid);
    }
    
    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs owned by the address
     */
    function getTicketsByOwner(address owner) external view returns (uint256[] memory) {
        require(owner != address(0), "Cannot query zero address");
        
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        uint256 currentIndex = 0;
        uint256 maxTokenId = _nextTokenId - 1;
        
        for (uint256 tokenId = 1; tokenId <= maxTokenId; tokenId++) {
            if (_ownerOf(tokenId) != address(0) && ownerOf(tokenId) == owner) {
                tokenIds[currentIndex] = tokenId;
                currentIndex++;
                
                if (currentIndex >= balance) {
                    break;
                }
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Check if a seat is already minted for an event
     * @param eventId Event identifier
     * @param seatId Seat ID to check
     * @return isMinted Whether the seat is already minted
     */
    function isSeatMinted(string calldata eventId, uint256 seatId) external view returns (bool) {
        return _mintedSeats[eventId][seatId];
    }
    
    /**
     * @dev Get the current token counter (next token ID - 1)
     * @return currentTokenId The current highest token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get total number of minted tokens
     * @return totalMinted Total number of tokens minted
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}