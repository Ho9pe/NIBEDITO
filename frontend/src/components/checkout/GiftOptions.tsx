import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiGift } from "react-icons/fi";

interface GiftOptionsProps {
  isGift: boolean;
  giftNote: string;
  onGiftToggle: (isGift: boolean) => void;
  onGiftNoteChange: (note: string) => void;
}

export default function GiftOptions({
  isGift,
  giftNote,
  onGiftToggle,
  onGiftNoteChange,
}: GiftOptionsProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 border-b border-purple-100 dark:border-purple-800/30">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
            <FiGift className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Gift Options
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="giftOption"
              checked={!isGift}
              onChange={() => onGiftToggle(false)}
              className="w-4 h-4 text-blue-600 border-2 border-slate-300 dark:border-slate-600 focus:ring-blue-500/20"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Buy for Self
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="giftOption"
              checked={isGift}
              onChange={() => onGiftToggle(true)}
              className="w-4 h-4 text-purple-600 border-2 border-slate-300 dark:border-slate-600 focus:ring-purple-500/20"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Gift Someone
            </span>
          </label>
        </div>

        {isGift && (
          <div className="space-y-2 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
            <Label
              htmlFor="giftNote"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              Gift Message
            </Label>
            <Textarea
              id="giftNote"
              value={giftNote}
              onChange={(e) => onGiftNoteChange(e.target.value)}
              placeholder="Add a personal message for the gift recipient"
              rows={4}
              maxLength={200}
              className="resize-none bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-700"
            />
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {giftNote.length}/200 characters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
