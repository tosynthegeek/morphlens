import hre from "hardhat";

async function getStorageAt(address: string, slotNumber: string) {
  const provider = hre.ethers.provider;
  const result = await provider.getStorage(address, slotNumber);

  return result.toString();
}

/**
 * @notice Decode the transaction input data using the ABI.
 * @param abi The ABI of the contract.
 * @param inputData The input data of the transaction.
 * @return The decoded transaction data, or an empty object if decoding fails.
 */
function decodeTransactionInput(abi: any[], inputData: string) {
  try {
    const iauction = new hre.ethers.Interface(abi);
    const decodedData = iauction.parseTransaction({ data: inputData });
    return decodedData;
  } catch (error) {
    console.error("Error decoding transaction input:");
    return { args: [] };
  }
}

async function main(value: number) {
  const index = 0;
  const address = "0xDA01D79Ca36b493C7906F3C032D2365Fb3470aEC";
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(
    "0xd109e8c395741b4b3130e3d84041f8f62af765ef",
    100,
    60 // 10 minutes for the auction duration
  );
  console.log(
    "Auction contract deployed on Morph to: ",
    await auction.getAddress()
  );

  console.log("Bidding....");
  const tx = await auction.bid({
    value: value.toString(),
  });
  await tx.wait();
  console.log("Bid successful!");

  // Trying to get the bid of an associated address
  try {
    console.log("Checking bid at Index: ", index);
    const bid = await auction.checkBid(index);
    console.log("Bid at Index 0 is:", bid);
  } catch (error) {
    console.error("Failed to check bid: Auction is still ongoing");
  }

  console.log("Waiting....");

  const endTime = await auction.checkAuctionEndTime();
  console.log("Auction endtime is: ", endTime);

  console.log("Still waiting....");

  try {
    await new Promise((resolve) => setTimeout(resolve, 100_000));
    console.log("Checking bid again");
    const bid = await auction.checkBid(index);
    console.log("Bid:", bid);
  } catch (error) {
    console.log("Failed to check bid: Auction is still ongoing");
  }

  const decodedInput = decodeTransactionInput(
    auction.interface.format(),
    tx.data
  );
  console.log("Decoded data input: ", decodedInput?.args);

  const StateData = await getStorageAt(await auction.getAddress(), "0x0");
  console.log("State data at slot 0x0 is: ", StateData);
}

main(120).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
