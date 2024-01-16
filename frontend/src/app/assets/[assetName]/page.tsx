"use client";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { assetName: string } }) {
    const router = useRouter();

    return (
        <div>page {params.assetName}</div>
    )
}