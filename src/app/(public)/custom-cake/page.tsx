import { CustomForm } from "@/components/custom-form";
import { settings } from "@/lib/catalogue";
import { configured } from "@/lib/supabase";
export const revalidate = 60;
export const metadata = {
  title: "Design your cake",
  description:
    "Create a personal cake brief with Creamy Creations. Choose your occasion, flavours, design and delivery details. Saved progress, no account required.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ design?: string }>;
}) {
  const { design } = await searchParams;
  const s = await settings();
  return (
    <div className="wrap">
      <div className="page-head text-center">
        <div className="eyebrow justify-center">Made just for you</div>
        <h1>Let’s dream up your cake.</h1>
        <p className="muted mx-auto">
          Tell us about your celebration. We’ll get in touch to discuss the
          details and prepare a personal quotation.
        </p>
      </div>
      <CustomForm
        design={design}
        businessNumber={s.whatsapp}
        demo={!configured()}
      />
    </div>
  );
}
