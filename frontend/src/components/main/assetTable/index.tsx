import Link from "next/link";
import { useState } from "react";

const AssetTable = () => {
    const [assets, setAssets] = useState([]);

    const assetsData = [
        {
            icon: "",
            name: "Ethereum",
            abbreviation: "ETH",
            totalSupply: 1,
            APY: 2,
            totalBorrowed: 3
        },
        {
            icon: "",
            name: "Bitcoin",
            abbreviation: "BTC",
            totalSupply: 4,
            APY: 5,
            totalBorrowed: 6
        },
        {
            icon: "",
            name: "Tether",
            abbreviation: "USDT",
            totalSupply: 7,
            APY: 8,
            totalBorrowed: 9
        },
        {
            icon: "",
            name: "Dai",
            abbreviation: "DAI",
            totalSupply: 10,
            APY: 11,
            totalBorrowed: 12
        },
        {
            icon: "",
            name: "USDC",
            abbreviation: "USDC",
            totalSupply: 13,
            APY: 14,
            totalBorrowed: 15
        },
        {
            icon: "",
            name: "Uniswap",
            abbreviation: "UNI",
            totalSupply: 16,
            APY: 17,
            totalBorrowed: 18
        },
        {
            icon: "",
            name: "Chainlink",
            abbreviation: "LINK",
            totalSupply: 0,
            APY: 0,
            totalBorrowed: 0
        },
        {
            icon: "",
            name: "Wrapped Bitcoin",
            abbreviation: "WBTC",
            totalSupply: 0,
            APY: 0,
            totalBorrowed: 0
        },
        {
            icon: "",
            name: "Sepolia",
            abbreviation: "SEP",
            totalSupply: 0,
            APY: 0,
            totalBorrowed: 0
        }

    ]

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "ascending",
    });

    const sortAssetsbyName = (key: string) => {
        const direction = key === sortConfig.key && sortConfig.direction === "ascending" ? "descending" : "ascending";

        const sortedAssets = [...assetsData].sort((a, b) => {
            const valueA = key === "name" ? a[key].toLowerCase() : a[key];
            const valueB = key === "name" ? b[key].toLowerCase() : b[key];

            return direction === "ascending" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        setAssets(sortedAssets);
        setSortConfig({ key, direction });
    };

    const sortAssetswithNumber = (key: string) => {
        const direction = key === sortConfig.key && sortConfig.direction === "ascending" ? "descending" : "ascending";

        const sortedAssetsbyNumber = [...assetsData].sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];

            return direction === "ascending" ? valueA - valueB : valueB - valueA;
        })
        setAssets(sortedAssetsbyNumber);
        setSortConfig({ key, direction });
    }
    return (
        <table className="w-full text-white text-center ml-5 mr-10 backdrop-blur-md">
            <thead className="">
                <tr>
                    <th >Icon</th>
                    <th className="cursor-pointer" onClick={() => sortAssetsbyName("name")} >Name</th>
                    <th className="cursor-pointer" onClick={() => sortAssetswithNumber("totalSupply")}>Total Supply</th>
                    <th className="cursor-pointer" onClick={() => sortAssetswithNumber("APY")} >APY</th>
                    <th className="cursor-pointer" onClick={() => sortAssetswithNumber("totalBorrowed")}>Total Borrowed</th>
                </tr>
            </thead>
            <tbody className="border-t-4">
                {assets.length > 0 ? assets.map((asset, index) => (
                    <tr key={index} className="border-t border-b">
                        <td className="w-10">{asset.icon}</td>
                        <td>{asset.name}{asset.abbreviation}</td>
                        <td>{asset.totalSupply}</td>
                        <td>{asset.APY}</td>
                        <td>{asset.totalBorrowed}</td>
                    </tr>
                )
                ) : assetsData.map((asset, index) => (
                    <tr key={index} className="border border-t">
                        <td className="w-10">{asset.icon}</td>
                        <td>
                            <p>{asset.name}</p>
                            {asset.abbreviation}</td>
                        <td>{asset.totalSupply}</td>
                        <td>{asset.APY}</td>
                        <td>{asset.totalBorrowed}</td>
                    </tr>
                ))
                }
            </tbody>
        </table >
    )
}

export default AssetTable