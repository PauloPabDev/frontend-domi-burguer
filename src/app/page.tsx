import { Suspense } from "react";
import GoogleReviewsSection from "@/components/home/GoogleReviewsSection";
import { ReviewsSkeleton } from "@/components/home/ReviewsSkeleton";
import HomeClient from "@/components/home/HomeClient";

export default function Home() {
  return <HomeClient reviews={
    <Suspense fallback={<ReviewsSkeleton />}>
      <GoogleReviewsSection />
    </Suspense>
  } />;
}
