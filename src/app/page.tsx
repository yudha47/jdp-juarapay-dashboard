import { redirect } from "next/navigation";

// Landing page publik sudah dipisah ke project tersendiri.
// Root "/" diarahkan ke dashboard; proxy.ts akan mengalihkan ke /login bila belum login.
export default function RootPage() {
    redirect("/dashboard");
}
