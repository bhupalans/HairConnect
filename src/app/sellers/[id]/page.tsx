
import { getSellerById, getProductsBySeller } from "@/lib/data";
import { notFound } from "next/navigation";
import { SellerProfileClientPage } from "./client-page";

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const sellerId = params.id;

  if (!sellerId) {
    notFound();
  }

  // Fetch data on the server
  const [seller, sellerProducts] = await Promise.all([
    getSellerById(sellerId),
    getProductsBySeller(sellerId),
  ]);

  if (!seller) {
    notFound();
  }

  // Pass the fetched data as props to the client component
  return <SellerProfileClientPage seller={seller} sellerProducts={sellerProducts} />;
}
