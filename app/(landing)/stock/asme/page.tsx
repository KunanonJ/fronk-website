import { redirect } from "next/navigation";

/** Legacy stock URL — About now lives at `/about`. */
export default function AsmeStockRedirectPage() {
  redirect("/about");
}
