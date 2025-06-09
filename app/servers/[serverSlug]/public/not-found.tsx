import { Page404 } from "@/features/page/page-404";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <Page404 />
      </div>
    </div>
  );
}