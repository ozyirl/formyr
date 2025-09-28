"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

const Landing = () => {
	return (
		<>
			<div className="flex items-center gap-3 justify-center h-screen">
				<div className="flex items-center gap-3">
					<span className="text-lg font-semibold text-foreground">Landing</span>
				</div>
			</div>
		</>
	);
};

export default Landing;
