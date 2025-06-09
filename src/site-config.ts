export const SiteConfig = {
  title: "Uracad",
  description: "Collect and showcase powerful video and text testimonials",
  prodUrl: "https://demo.uracad.com",
  domain: "demo.uracad.com",
  appIcon: "/images/icon.png",
  company: {
    name: "uracad",
    address: "", // Remove if not needed
  },
  brand: {
    primary: "#007291", // You can adjust this to your brand color
  },
  team: {
    image: "https://melvynx.com/images/me/twitter-en.jpg",
    website: "https://melvynx.com",
    twitter: "https://twitter.com/melvyn_me",
    name: "Bastien",
  },
  features: {
    /**
     * If enable, you need to specify the logic of upload here : src/features/images/uploadImageAction.tsx
     * You can use Vercel Blob Storage : https://vercel.com/docs/storage/vercel-blob
     * Or you can use Cloudflare R2 : https://mlv.sh/cloudflare-r2-tutorial
     * Or you can use AWS S3 : https://mlv.sh/aws-s3-tutorial
     */
    enableImageUpload: true as boolean,
    /**
     * If enable, the user will be redirected to `/servers` when he visits the landing page at `/`
     * The logic is located in middleware.ts
     */
    enableLandingRedirection: true as boolean,
  },
};
