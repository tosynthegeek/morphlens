// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Auction {
    // Auction details
    address payable public seller; // Address of the seller
    uint256 public startingPrice; // Starting price of the auction
    uint256 public highestBid; // Highest bid amount
    address public highestBidder; // Address of the highest bidder
    uint256 public auctionEndTime; // Timestamp when the auction ends
    bool public auctionEnded; // Flag to indicate if the auction has ended
    uint256 public bidCount; // Total count of bids placed in the auction

    // Struct to store bid details
    struct Bid {
        address bidder;
        uint256 bid;
    }

    Bid[] public bids; // Array to store all bids

    // Events for auction lifecycle
    event BidCreated(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 winningBid);

    // Constructor to initialize auction parameters
    constructor(
        address payable _seller, // Address of the seller
        uint256 _startingPrice, // Starting price of the auction
        uint256 _auctionEndTime // Duration of the auction
    ) {
        seller = _seller;
        startingPrice = _startingPrice;
        highestBid = startingPrice;
        auctionEndTime = block.timestamp + _auctionEndTime; // Set the end time of the auction
    }

    /**
     * @notice Allows a user to place a bid in the auction.
     * @dev The bid must be higher than the current highest bid, and the auction must not have ended.
     */
    function bid() external payable {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(
            msg.value > highestBid,
            "Bid must be higher than the current highest bid"
        );
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }
        highestBid = msg.value;
        highestBidder = msg.sender;
        Bid memory newBid = Bid(msg.sender, msg.value);
        bids.push(newBid);
        bidCount++;
        emit BidCreated(msg.sender, msg.value);
    }

    /**
     * @notice Allows the highest bidder or seller to check the bid at a given index.
     * @dev The auction must have ended, and only the highest bidder or seller can check bids.
     * @param index The index of the bid to check.
     * @return The bidder's address and bid amount.
     */
    function checkBid(uint256 index) external view returns (address, uint256) {
        require(index <= bidCount, "Wrong Index");
        Bid memory getBid = bids[index];
        require(block.timestamp > auctionEndTime, "Auction is still ongoing");
        require(
            msg.sender == highestBidder || msg.sender == seller,
            "Only Highest Bidder and seller can check bids"
        );
        return (getBid.bidder, getBid.bid);
    }

    /**
     * @notice Returns the timestamp when the auction ends.
     * @return The timestamp when the auction ends.
     */
    function checkAuctionEndTime() external view returns (uint256) {
        return auctionEndTime;
    }

    /**
     * @notice Ends the auction and transfers the highest bid amount to the seller.
     * @dev The auction must have ended.
     */
    function endAuction() external {
        require(block.timestamp >= auctionEndTime, "Auction is still ongoing");
        auctionEnded = true; // Update auction status
        seller.transfer(highestBid); // Transfer the highest bid to the seller
        emit AuctionEnded(highestBidder, highestBid); // Emit AuctionEnded event
    }

    /**
     * @notice Returns the auction details.
     * @return The seller's address, starting price, highest bid amount, highest bidder's address,
     * auction end timestamp, auction end status, and total bid count.
     */
    function getAuctionDetails()
        external
        view
        returns (address, uint256, uint256, address, uint256, bool, uint256)
    {
        return (
            seller,
            startingPrice,
            highestBid,
            highestBidder,
            auctionEndTime,
            auctionEnded,
            bidCount
        );
    }
}
