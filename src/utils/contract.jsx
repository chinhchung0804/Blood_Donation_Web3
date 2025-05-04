import { ethers } from "ethers";
import WalletABI from "../../backend/artifacts/contracts/Smart_Contract.sol/Wallet.json"; // ABI từ file compile

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Địa chỉ hợp đồng sau khi deploy

export const claimReward = async () => {
  if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, WalletABI.abi, signer);

  const tx = await contract.claimReward();
  await tx.wait();
};

export const donateEther = async (amount) => {
  if (!window.ethereum) throw new Error("Vui lòng cài đặt MetaMask");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, WalletABI.abi, signer);

  const tx = await contract.donate({
    value: ethers.parseEther(amount), // Chuyển đổi amount (ETH) thành wei
  });
  await tx.wait();
};