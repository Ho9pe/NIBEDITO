"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiEdit2, FiMail, FiPhone, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { getImageUrl } from "@/utils/imageUtils";
import type { User } from "@/types";

interface AccountSummaryProps {
  user: User;
}

export default function AccountSummary({ user }: AccountSummaryProps): React.JSX.Element {
  return (
    <Card className="border-slate-200 dark:border-slate-800 relative overflow-hidden">
      {/* Rose accent corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent dark:from-rose-600/10 rounded-bl-full"></div>
      
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-xl font-semibold">Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700">
            {user.profilePicture ? (
              <Image
                src={getImageUrl(user.profilePicture)}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {user.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Verification Status
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
              </div>
              {user.verificationStatus.email ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                  <FiXCircle className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Phone</span>
              </div>
              {user.verificationStatus.phone ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                  <FiXCircle className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <Button asChild className="w-full" variant="outline">
          <Link href="/profile">
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
