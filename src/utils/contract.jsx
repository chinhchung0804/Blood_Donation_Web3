import { ethers } from "ethers";
import WalletABI from "../../backend/artifacts/contracts/Smart_Contract.sol/Wallet.json";
import contractAddresses from "../contract-address.json";

const contractAddress = contractAddresses.Wallet;

export const claimReward = async () => {
  if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, WalletABI.abi, signer);

  const tx = await contract.claimReward();
  return tx; // Trả về đối tượng giao dịch
};

export const donateEther = async (amount) => {
  if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, WalletABI.abi, signer);

  const tx = await contract.donate({
    value: ethers.parseEther(amount),
  });
  return tx; // Trả về đối tượng giao dịch
};