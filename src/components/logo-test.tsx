import localFont from "next/font/local";

const norse = localFont({
  src: "../public/fonts/Norse-Bold.otf",
  variable: "--font-norse",
});

export default function FormyrLogo() {
  return <h1 className={`${norse.className} text-4xl`}>Formyr</h1>;
}
