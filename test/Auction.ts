import hre from "hardhat";
import { expect } from "chai";
import { Auction } from "../typechain-types";

describe("Auction", function () {
  let Auction;
  let auction: Auction;
  let owner;
  let addr1;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    Auction = await hre.ethers.getContractFactory("Auction");
    auction = (await Auction.deploy(addr1.address, 100, 3600)) as Auction; // Explicitly casting to Auction type
    console.log("Auction contract deployed to: ", await auction.getAddress());
  });

  it("Should place a bid", async function () {
    await auction.connect(addr2).bid({ value: 200 }); // Bid of 200 from addr2
    const highestBid = await auction.highestBid();
    const highestBidder = await auction.highestBidder();
    expect(highestBid).to.equal(200);
    expect(highestBidder).to.equal(addr2.address);
  });

  it("Should end the auction", async function () {
    await auction.endAuction(); // Ending the auction
    const auctionEnded = await auction.auctionEnded();
    expect(auctionEnded).to.equal(true);
  });

  it("Should check bid at index 0", async function () {
    await auction.connect(addr2).bid({ value: 200 }); // Bid of 200 from addr2
    const [bidder, bidAmount] = await auction.checkBid(0);
    expect(bidder).to.equal(addr2.address);
    expect(bidAmount).to.equal(200);
  });

  it("Should check auction end time", async function () {
    const auctionEndTime = await auction.checkAuctionEndTime();
    // You can do assertions on the auction end time here
  });

  it("Should get auction details", async function () {
    const [
      seller,
      startingPrice,
      highestBid,
      highestBidder,
      auctionEndTime,
      auctionEnded,
      bidCount,
    ] = await auction.getAuctionDetails();
    // You can do assertions on the auction details here
  });
});
