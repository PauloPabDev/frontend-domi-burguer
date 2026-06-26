"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CheckoutFormProvider } from "@/contexts/CheckoutFormContext";
import { ProfileHeader } from "./ProfileHeader";
import { PointsSection } from "./PointsSection";
import { AddressesSection } from "./AddressesSection";
import { PhoneSection } from "./PhoneSection";
import { CodesSection } from "./CodesSection";
import { ComingSoonSection } from "./ComingSoonSection";
import { WorkSection } from "./WorkSection";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary-red" size={70} />
            </div>
        );
    }

    return (
        <CheckoutFormProvider>
            <div className="mt-[130px] min-h-screen bg-white py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <ProfileHeader />
                    <WorkSection />
                    <AddressesSection />
                    <PhoneSection />
                    {/* <OrdersSection /> */}
                    <ComingSoonSection title="MIS PEDIDOS" />
                    <CodesSection />
                    <PointsSection />

                </div>
            </div>
        </CheckoutFormProvider>
    );
}
