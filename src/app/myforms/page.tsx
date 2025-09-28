"use client";
import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	RedirectToSignIn,
} from "@clerk/nextjs";

import Image from "next/image";
import { Button } from "@/components/ui/button";

const MyForms = () => {
	const forms = [
		{
			id: 1,
			title: "Customer Feedback",
			image: "/placeholder.png",
		},
		{
			id: 2,
			title: "Event Registration",
			image: "/placeholder.png",
		},
		{
			id: 3,
			title: "Event Registration",
			image: "/placeholder.png",
		},
		{
			id: 4,
			title: "Event Registration",
			image: "/placeholder.png",
		},
		{
			id: 5,
			title: "Event Registration",
			image: "/placeholder.png",
		},
	];

	return (
		<>
			<SignedIn>
				<div className="p-8 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
					{forms.map((form) => (
						<div
							key={form.id}
							className="rounded-2xl shadow-md bg-card text-card-foreground overflow-hidden"
						>
							<Image
								src={form.image}
								alt={form.title}
								width={400}
								height={200}
								className="w-full h-40 object-cover"
							/>
							<div className="p-4 flex items-center justify-between">
								<h2 className="text-lg font-semibold">{form.title}</h2>
								<Button size="sm" variant="secondary">
									Edit
								</Button>
							</div>
						</div>
					))}
				</div>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
};

export default MyForms;
