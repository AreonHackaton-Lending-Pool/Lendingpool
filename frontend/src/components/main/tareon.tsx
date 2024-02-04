import { readContract, readContracts, getTransaction } from '@wagmi/core'
// import lendingMarketAbi from "../../../../smartContract/abi/lendingMarket.json";
import poolAbi from "../../../../smartContract/abi/poolAbi.json";
import { useSimulateContract } from 'wagmi';
import { parseEther } from 'viem';

export const tokenPoolContractAddresses: string[] = [
    // "0xA8F66B7fdB33111515A9190DDdf21718AaA58924", //METH_POOL
    // "0xfD9E58954Ad95596Dfa58478411dB695d8dDf36D" //DMS_POOL
    "0x9Ce106b4F2D56Db9713B13523D4baaD8178c2eFc", //LINK 
    "0xbA20B5C24d2ef758e8D0F95812d09F3724f85a38",  //NOTRINO 
    "0xC1E455d3BAfFa4d723CC381b003f92ad56A248ac"  //nAREA
]

export const tokenAddresses = [
    // "0x0e7252df74a3462A05f06a487717cC67D4bF79e2", //METH
    // "0x8cD232F73507163982C4278dd4af1e93255D8FcA" //DEIMOS
    // "0xA510F474921888a808Af04eAE108b1097209403D", //NOTRINO
    // "0x85959c15655E277E7A39E9C8169BeE3F767aec74", //TestAreon
    "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", //LINK
    "0x97696814bf341149F1Df132aD0c8f4b5Cd056381", //NOTRINO
    "0xeB2E342d7d28BE7a9D9782DE7676e374c8720BEa" //nAREA
]

export const getUserCollateral = async (config: any, userAccount: any) => {
    const results = [];
    for (const tokenPoolContractAddress of tokenPoolContractAddresses) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddress,
                functionName: 'getUserCollateral',
                args: [userAccount],
            })
            // console.log("getUserCollateral", response)
            results.push(response)
            // return response;
        } catch (error) {
            console.error(error);
        }
    }
    // console.log(results)
    return results;
}


export const getAllTransactions = async (config: any, userAccount: any) => {
    const results = [];
    for (const tokenPoolContractAddress of tokenPoolContractAddresses) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddress as `0x${string}`,
                functionName: 'getAllDepositTransactions',
                args: [userAccount],
            })
            // console.log("getAllTransactions", response)
            results.push(response)
        } catch (error) {
            console.error(error);
        }
    }
    // console.log(results)
    return results
}

export const getAllBorrowTransactions = async (config: any, userAccount: any) => {
    const results = [];
    for (const tokenPoolContractAddress of tokenPoolContractAddresses) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddress as `0x${string}`,
                functionName: 'getAllBorrowTransactions',
                args: [userAccount],
            })
            // console.log("getAllTransactions", response)
            results.push(response)
        } catch (error) {
            console.error(error);
        }
    }
    // console.log(results)
    return results
}

export const getTotalSupply = async (config: any) => {
    const results = [];
    for (const tokenAddress of tokenPoolContractAddresses) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenAddress,
                functionName: 'getTotalSupplies',
                args: [],
            })
            results.push(response)
            // console.log("getTotalSupplies", response)
        } catch (error) {
            console.error(error);
        }
    }
    // console.log(results)
    return results
}

export const getTotalBorrow = async (config: any) => {
    const results = [];
    for (const tokenPoolContractAddress of tokenPoolContractAddresses) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddress,
                functionName: 'getTotalBorrows',
                args: [],
            })
            results.push(response)
            // console.log("getTotalSupplies", response)
        } catch (error) {
            console.error(error);
        }
    }
    return results
}

export const getPoolTokenSymbol = async (config: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getTokenSymbol',
                args: [],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results
}

export const getTokenAddress = async (config: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getTokenAddress',
                args: [],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}
export const getTokenPrice = async (config: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getChainlinkDataFeedLatestAnswer',
                args: [],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
    }
    console.log(results)
    return results;
}
export const getUserBalance = async (config: any, userAccount: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getUserBalance',
                args: [userAccount],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}

export const getSupplyAPY = async (config: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'calculateAPY',
                args: [],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}
export const getBorrowAPR = async (config: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'calculateAPR',
                args: [],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}
export const getUserTotalSupplies = async (config: any, userAccount: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getUserTotalSupplies',
                args: [userAccount],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}
export const getUserBorrowAmount = async (config: any, userAccount: any) => {
    const results = [];
    for (let i = 0; i < tokenPoolContractAddresses.length; i++) {
        try {
            const response: any = await readContract(config, {
                abi: poolAbi,
                address: tokenPoolContractAddresses[i],
                functionName: 'getUserBorrowAmount',
                args: [userAccount],
            })
            results.push(response)
        } catch (error) {
            console.error(error);
        }
        // console.log(results)
    }
    return results;
}
