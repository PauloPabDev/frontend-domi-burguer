import GoogleReviewsSection from "@/components/home/GoogleReviewsSection";
import HomeClient from "@/components/home/HomeClient";

export default function Home() {
  return <HomeClient reviews={<GoogleReviewsSection />} />;
}
