import { PHONE_MAX_LENGTH, PHONE_PLACEHOLDER, PHONE_PATTERN } from "@/utils/phone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

interface FormData {
  street: string;
  city: string;
  state: string;
  addressDetails: string;
  phone: string;
  email: string;
}

interface ShippingInformationProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ShippingInformation({
  formData,
  onFormDataChange,
  onPhoneChange,
}: ShippingInformationProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20 border-b border-blue-100 dark:border-blue-800/30">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <FiMapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-bold">
            Shipping Information
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="street"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              Street Address *
            </Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Enter your street address"
              required
              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              City *
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              required
              className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="state"
            className="text-slate-700 dark:text-slate-300 font-medium"
          >
            State *
          </Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter your state"
            required
            className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="addressDetails"
            className="text-slate-700 dark:text-slate-300 font-medium"
          >
            Additional Address Details
          </Label>
          <Textarea
            id="addressDetails"
            name="addressDetails"
            value={formData.addressDetails}
            onChange={handleInputChange}
            placeholder="Add any additional address details, landmarks, or delivery instructions"
            rows={3}
            maxLength={200}
            className="resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.addressDetails.length}/200 characters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              Phone Number *
            </Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-900 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-md">
                <FiPhone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onPhoneChange}
                placeholder={PHONE_PLACEHOLDER}
                maxLength={PHONE_MAX_LENGTH}
                pattern={PHONE_PATTERN}
                required
                disabled
                className="rounded-l-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              Email Address *
            </Label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="pl-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
