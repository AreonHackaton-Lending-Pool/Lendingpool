import { useEffect, useState } from "react";
import { useAccount, useConnect, useWriteContract, useDisconnect, useSimulateContract, useReadContract, useBalance, useEstimateGas, useGasPrice, useSendTransaction } from 'wagmi';
import { parseEther, parseGwei } from 'viem';
// import lendingPoolAbi from "../../../../../smartContract/abi/lendinPool.json";
import { readContract, readContracts, getTransaction } from '@wagmi/core'
import lendingMarketAbi from "../../../../../smartContract/abi/lendingMarket.json";
import poolAbi from "../../../../../smartContract/abi/poolAbi.json";
import { tokenPoolContractAddresses } from "../tareon";

const contractAddress = "0x3b10594616c3C605dbAE79bF00af79163694A3d0";

export const getUserLoanAmount = async (config: any, userAccount: any) => {
  try {
    const response: any = await readContract(config, {
      abi: poolAbi,
      address: contractAddress,
      functionName: 'getUserLoanAmount',
      args: [userAccount],
    })
    // console.log("getUserLoanAmount", response)
    return response;
  } catch (error) {
    console.error(error);
  }
}

export const getUserCollateral = async (config: any, userAccount: any) => {
  try {
    const response: any = await readContract(config, {
      abi: poolAbi,
      address: contractAddress,
      functionName: 'getUserCollateral',
      args: [userAccount],
    })
    // console.log("getUserCollateral", response)
    return response;
  } catch (error) {
    console.error(error);
  }
}

export const getDepositedValue = async (config: any) => {
  try {
    const response: any = await readContract(config, {
      abi: poolAbi,
      address: contractAddress,
      functionName: 'getDepositedValue',
      args: [],
    })
    // console.log("getDepositedValue", response)
    return response;
  } catch (error) {
    console.error(error);
  }
}

export const getAllTransactions = async (config: any, userAccount: any) => {
  for (const tokenPoolContractAddress of tokenPoolContractAddresses) {
    try {
      const response: any = await readContract(config, {
        abi: poolAbi,
        address: tokenPoolContractAddress as `0x${string}`,
        functionName: 'getAllTransactions',
        args: [userAccount],
      })
      // console.log("getAllTransactions", response)
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  // try {
  //   const response: any = await readContract(config, {
  //     abi: poolAbi,
  //     address: tokenPoolContractAddresses ,
  //     functionName: 'getAllTransactions',
  //     args: [userAccount],
  //   })
  //   // console.log("getAllTransactions", response)
  //   return response;
  // } catch (error) {
  //   console.error(error);
  // }
}

export const getAllPools = async (config: any, tokenSymbol: string, tokenAddress: string) => {
  try {
    const response: any = await readContract(config, {
      abi: lendingMarketAbi,
      address: "0x39b5cc2629610140195F616c6a75978a1640701c",
      functionName: 'getAllAssets',
      args: [],
    })
    // console.log("getAllPools", response)
    return response;
  } catch (error) {
    console.error(error);
  }
}