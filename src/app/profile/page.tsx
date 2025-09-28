"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

const Profile = () => {
	return (
		<>
			<div className="flex items-center gap-3 justify-center h-screen">
				<SignedIn>
					<div className="flex items-center gap-3">
						<span className="text-lg font-semibold text-foreground">
							Profile
						</span>
					</div>
				</SignedIn>
			</div>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
};

export default Profile;
