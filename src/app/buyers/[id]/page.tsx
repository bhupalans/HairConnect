
import { getBuyerById, getSourcingRequestsByBuyer } from "@/lib/data";
import { notFound } from "next/navigation";
import { BuyerProfileClientPage } from "./client-page";

export default async function BuyerProfilePage({ params }: { params: { id: string } }) {
  const [buyer, sourcingRequests] = await Promise.all([
    getBuyerById(params.id),
    getSourcingRequestsByBuyer(params.id),
  ]);

  if (!buyer) {
    notFound();
  }

  // Pass the fetched data as props to the client component
  return <BuyerProfileClientPage buyer={buyer} sourcingRequests={sourcingRequests} />;
}
