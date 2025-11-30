// ./package/src/app/api/parceiros/route.ts
import { NextResponse } from "next/server";

const parceiroData = [
  "/images/parceiro/parceiro-icon-1.svg",
  "/images/parceiro/parceiro-icon-2.svg",
  "/images/parceiro/parceiro-icon-3.svg",
  "/images/parceiro/parceiro-icon-4.svg",
  "/images/parceiro/parceiro-icon-5.svg",
  "/images/parceiro/parceiro-icon-6.svg",
  "/images/parceiro/parceiro-icon-7.svg",
]


export const GET = async () => {
  return NextResponse.json({
    parceiroData
  });
};