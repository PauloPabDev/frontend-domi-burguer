"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckoutFormProvider } from "@/contexts/CheckoutFormContext";
import { ProfileHeader } from "./ProfileHeader";
import { PointsSection } from "./PointsSection";
import { AddressesSection } from "./AddressesSection";
import { PhoneSection } from "./PhoneSection";
import { NotificationsSection } from "./NotificationsSection";
import { AnnouncementsSection } from "./AnnouncementsSection";
import { CodesSection } from "./CodesSection";
import { OrdersSection } from "./OrdersSection";
import { WorkSection } from "./WorkSection";
import { ProfileSkeleton } from "./ProfileSkeleton";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <ProfileSkeleton />;
    }

    return (
        <CheckoutFormProvider>
            <div className="mt-8 lg:mt-[130px] min-h-screen bg-white py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <ProfileHeader />
                    <WorkSection />
                    <OrdersSection />
                    <PointsSection />
                    <CodesSection />
                    <AddressesSection />
                    <PhoneSection />
                    <AnnouncementsSection />
                    <NotificationsSection />
                </div>
            </div>
        </CheckoutFormProvider>
    );
}
